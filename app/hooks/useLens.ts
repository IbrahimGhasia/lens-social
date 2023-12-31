import {
	ApolloClient,
	InMemoryCache,
	ApolloLink,
	gql,
	HttpLink,
} from "@apollo/client";
import { LOGIN } from "../constants/graphql/Login";
import { CREATE_PROFILE } from "../constants/graphql/CreateProfile";
import { AUTHENTICATE_MUTATION } from "../constants/graphql/Authenticate";
import { CREATE_POST_TYPED_DATA } from "../constants/graphql/CreatePostTypedData";
import { GET_PROFILE } from "../constants/graphql/GetProfile";
import { GET_PUBLICATIONS } from "../constants/graphql/GetPost";
import { LENS_PROFILE_EXISTS } from "../constants/graphql/GetProfileId";
import { useProvider } from "wagmi";
import { Signer } from "ethers";
import {
	signedTypeData,
	getAddressFromSigner,
	splitSignature,
	getSigner,
} from "@/ethers.service";
import { ethers, utils, BigNumber } from "ethers";
import { lensAbi, LENS_FOLLOW_NFT_ABI } from "../constants";
import {
	RecommendedProfilesDocument,
	CreateFollowTypedDataDocument,
	CreateUnfollowTypedDataDocument,
	FollowRequest,
	UnfollowRequest,
	CreatePublicCommentRequest,
	CreateCommentTypedDataDocument,
} from "../constants/generated";

const APIURL = "https://api-mumbai.lens.dev/";

export const apolloClient = new ApolloClient({
	uri: APIURL,
	cache: new InMemoryCache(),
});

export default function useLens() {
	const provider = useProvider();
	const login = async (address: `0x${string}`, signer: any) => {
		const response = await apolloClient.query({
			query: gql(LOGIN),
			variables: {
				address: address,
			},
		});
		console.log("Login Successful", response);
		console.log(signer);
		const signature = await signer.signMessage(
			response.data.challenge.text
		);
		console.log("signature", signature);
		const mutationRes = await apolloClient.mutate({
			mutation: gql(AUTHENTICATE_MUTATION),
			variables: {
				address: address,
				signature: signature,
			},
		});

		console.log("Mutation res", mutationRes);

		const httpLink = new HttpLink({ uri: "https://api-mumbai.lens.dev/" });

		const authLink = new ApolloLink((operation, forward) => {
			const token = mutationRes.data.authenticate.accessToken;
			console.log("token", token);

			operation.setContext({
				headers: {
					"x-access-token": token ? `Bearer ${token}` : "",
				},
			});

			// Call the next link in the middleware chain.
			return forward(operation);
		});

		return new ApolloClient({
			link: authLink.concat(httpLink), // Chain it with the HttpLink
			cache: new InMemoryCache(),
		});
	};

	const createProfile = async (
		username: string,
		address: `0x${string}`,
		signer: any
	) => {
		const client = await login(address, signer);
		const createProfRes = await client.mutate({
			mutation: gql(CREATE_PROFILE),
			variables: {
				username: username,
			},
		});
		console.log("createProfRes", createProfRes);
		const txHash = createProfRes.data.createProfile.txHash;
		const txReceipt = await provider.waitForTransaction(txHash);
		console.log("txReceipt", txReceipt);
		return txReceipt;
	};

	const uploadPost = async (
		profileId: string,
		signer: Signer,
		address: `0x${string}`,
		title: string,
		description: string,
		postType: "post",
		isEncrypted: boolean,
		assetId?: string
	) => {
		const tags = isEncrypted ? ["encrypted", postType] : [postType];
		let metadata = {
			version: "2.0.0",
			mainContentFocus: "TEXT_ONLY",
			metadata_id: crypto.randomUUID(),
			description: null,
			locale: "en-US",
			content: description,
			external_url: null,
			image: null,
			imageMimeType: null,
			name: title,
			attributes: [],
			tags: tags,
			appId: "testAppId",
		};

		const resForJsonCid = await fetch("http://localhost:3000/" + "/ipfs", {
			method: "POST",
			body: JSON.stringify(metadata),
			headers: { "Content-Type": "application/json" },
		});

		const jsonOfResForJsonCid = await resForJsonCid.json();

		const ipfsResult =
			"https://" +
			jsonOfResForJsonCid.cid +
			".ipfs.nftstorage.link/data.json";
		console.log("stored metadata json with cid:", ipfsResult);
		console.log(ipfsResult);

		const createPostRequest = {
			profileId: profileId,
			contentURI: ipfsResult,
			collectModule: {
				freeCollectModule: { followerOnly: true },
			},
			referenceModule: {
				followerOnlyReferenceModule: false,
			},
		};

		try {
			const apolloClient = await login(address, signer);
			const result = await apolloClient.mutate({
				mutation: gql(CREATE_POST_TYPED_DATA),
				variables: {
					request: createPostRequest,
				},
			});
			const typedData = result.data.createPostTypedData.typedData;
			const signature = await signedTypeData(
				typedData.domain,
				typedData.types,
				typedData.value
			);
			console.log("useLens Signature", signature);
			const { v, r, s } = ethers.utils.splitSignature(signature);
			console.log("abc", { v, r, s });
			const lensHub = new ethers.Contract(
				"0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
				lensAbi,
				signer
			);
			const tx = await lensHub.postWithSig({
				profileId: typedData.value.profileId,
				contentURI: typedData.value.contentURI,
				collectModule: typedData.value.collectModule,
				collectModuleInitData: typedData.value.collectModuleInitData,
				referenceModule: typedData.value.referenceModule,
				referenceModuleInitData:
					typedData.value.referenceModuleInitData,
				sig: {
					v,
					r,
					s,
					deadline: typedData.value.deadline,
				},
			});
			console.log("tx.hash", tx.hash);
			const receipt = await tx.wait();
			console.log("receipt", receipt);
		} catch (error) {
			console.log("error", error);
		}
	};

	const getPosts = async (profId: string) => {
		const response = await apolloClient.query({
			query: gql(GET_PUBLICATIONS),
			variables: {
				profileId: profId,
			},
		});
		console.log("response", response);
		return response.data.publications.items;
	};

	const profileExists = async (handle: string) => {
		console.log("handle", handle);
		const response = await apolloClient.query({
			query: gql(LENS_PROFILE_EXISTS),
			variables: {
				name: `${handle}.test`,
			},
		});
		console.log("profileExists", response);
		let exists = false;
		if (response.data.profile !== null) {
			exists = true;
		}
		return exists;
	};

	const getProfileId = async (handle: string) => {
		console.log("handle", handle);
		const response = await apolloClient.query({
			query: gql(LENS_PROFILE_EXISTS),
			variables: {
				name: `${handle}.test`,
			},
		});
		return response.data.profile.id;
	};

	const getProfile = async (username: string) => {
		const response = await apolloClient.query({
			query: gql(GET_PROFILE),
			variables: {
				username,
			},
		});

		return response.data.profile;
	};

	const getRecommendedProfilesRequest = async () => {
		const result = await apolloClient.query({
			query: RecommendedProfilesDocument,
		});

		return result.data.recommendedProfiles;
	};

	const createFollowTypedData = async (
		request: FollowRequest,
		client: any
	) => {
		const result = await client.mutate({
			mutation: CreateFollowTypedDataDocument,
			variables: {
				request,
			},
		});

		console.log("Result", result);

		return result.data!.createFollowTypedData;
	};

	const follow = async (
		profileId: string,
		_address: `0x${string}`,
		signer: any
	) => {
		const address = _address;
		console.log("follow: address", address);
		const client = await login(address, signer);

		const result = await createFollowTypedData(
			{
				follow: [
					{
						profile: profileId,
					},
				],
			},
			client
		);
		console.log("follow: result", result);

		const typedData = result.typedData;
		console.log("follow: typedData", typedData);

		const signature = await signedTypeData(
			typedData.domain,
			typedData.types,
			typedData.value
		);
		console.log("follow: signature", signature);

		const { v, r, s } = splitSignature(signature);

		const lensHub = new ethers.Contract(
			"0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
			lensAbi,
			signer
		);
		const tx = await lensHub.followWithSig({
			follower: getAddressFromSigner(),
			profileIds: typedData.value.profileIds,
			datas: typedData.value.datas,
			sig: {
				v,
				r,
				s,
				deadline: typedData.value.deadline,
			},
		});
		console.log("follow: tx hash", tx.hash);
		return tx.hash;
	};

	const createUnfollowTypedData = async (
		request: UnfollowRequest,
		client: any
	) => {
		const result = await client.mutate({
			mutation: CreateUnfollowTypedDataDocument,
			variables: {
				request,
			},
		});

		return result.data!.createUnfollowTypedData;
	};

	const unfollow = async (
		profileID: string,
		_address: `0x${string}`,
		signer: any
	) => {
		const address = getAddressFromSigner();
		console.log("unfollow: address", address);

		const client = await login(_address, signer);
		console.log("Client", client);

		const result = await createUnfollowTypedData(
			{ profile: profileID },
			client
		);
		console.log("unfollow: result", result);

		const typedData = result.typedData;
		console.log("unfollow: typedData", typedData);

		const signature = await signedTypeData(
			typedData.domain,
			typedData.types,
			typedData.value
		);
		console.log("unfollow: signature", signature);

		const { v, r, s } = splitSignature(signature);

		// load up the follower nft contract
		const followNftContract = new ethers.Contract(
			typedData.domain.verifyingContract,
			LENS_FOLLOW_NFT_ABI,
			signer
		);

		const sig = {
			v,
			r,
			s,
			deadline: typedData.value.deadline,
		};

		// force the tx to send
		const tx = await followNftContract.burnWithSig(
			typedData.value.tokenId,
			sig
		);
		console.log("follow: tx hash", tx.hash);
	};

	const createCommentTypedData = async (
		request: CreatePublicCommentRequest,
		client: any
	) => {
		const result = await client.mutate({
			mutation: CreateCommentTypedDataDocument,
			variables: {
				request,
			},
		});

		return result.data!.createCommentTypedData;
	};

	const signCreateCommentTypedData = async (
		request: CreatePublicCommentRequest,
		client: any
	) => {
		const result = await createCommentTypedData(request, client);
		console.log("create comment: createCommentTypedData", result);

		const typedData = result.typedData;
		console.log("create comment: typedData", typedData);

		const signature = await signedTypeData(
			typedData.domain,
			typedData.types,
			typedData.value
		);
		console.log("create comment: signature", signature);

		return { result, signature };
	};

	const createComment = async (
		profileID: string,
		address: `0x${string}`,
		signer: any,
		postID: string,
		title: string,
		comment: string
	) => {
		const prefix = "create comment";
		const profileId = profileID;
		if (!profileId) {
			throw new Error("Must define PROFILE_ID in the .env to run this");
		}
		console.log(`${prefix}: address`, address);

		const client = await login(address, signer);

		let metadata = {
			version: "2.0.0",
			mainContentFocus: "TEXT_ONLY",
			metadata_id: crypto.randomUUID(),
			description: "Description",
			locale: "en-US",
			content: comment,
			external_url: null,
			image: null,
			imageMimeType: null,
			name: title,
			attributes: [],
			tags: ["using_api_example"],
			appId: "testAppId",
		};

		const resForJsonCid = await fetch("http://localhost:3000/" + "/ipfs", {
			method: "POST",
			body: JSON.stringify(metadata),
			headers: { "Content-Type": "application/json" },
		});

		const jsonOfResForJsonCid = await resForJsonCid.json();

		const ipfsResult =
			"https://" +
			jsonOfResForJsonCid.cid +
			".ipfs.nftstorage.link/data.json";
		console.log("stored metadata json with cid:", ipfsResult);
		console.log(ipfsResult);

		// hard coded to make the code example clear
		const createCommentRequest: CreatePublicCommentRequest = {
			profileId,
			// remember it has to be indexed and follow metadata standards to be traceable!
			publicationId: postID,
			contentURI: `ipfs://${ipfsResult}`,
			collectModule: {
				revertCollectModule: true,
			},
			referenceModule: {
				followerOnlyReferenceModule: false,
			},
		};

		const signedResult = await signCreateCommentTypedData(
			createCommentRequest,
			client
		);
		console.log(`${prefix}: signedResult`, signedResult);

		const typedData = signedResult.result.typedData;

		const { v, r, s } = splitSignature(signedResult.signature);

		const lensHub = new ethers.Contract(
			"0x60Ae865ee4C725cd04353b5AAb364553f56ceF82",
			lensAbi,
			signer
		);
		const tx = await lensHub.commentWithSig(
			{
				profileId: typedData.value.profileId,
				contentURI: typedData.value.contentURI,
				profileIdPointed: typedData.value.profileIdPointed,
				pubIdPointed: typedData.value.pubIdPointed,
				collectModule: typedData.value.collectModule,
				collectModuleInitData: typedData.value.collectModuleInitData,
				referenceModule: typedData.value.referenceModule,
				referenceModuleInitData:
					typedData.value.referenceModuleInitData,
				referenceModuleData: typedData.value.referenceModuleData,
				sig: {
					v,
					r,
					s,
					deadline: typedData.value.deadline,
				},
			},
			{ gasLimit: 500000 }
		);
		console.log(`${prefix}: tx hash`, tx.hash);
	};

	return {
		login,
		createProfile,
		getProfile,
		uploadPost,
		getPosts,
		profileExists,
		getProfileId,
		getRecommendedProfilesRequest,
		follow,
		unfollow,
		createComment,
	};
}
