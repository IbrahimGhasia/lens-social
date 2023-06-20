"use client";
import { useEffect, useState } from "react";
import useLens from "../hooks/useLens";
import { useAccount } from "wagmi";
import { useSigner } from "wagmi";

export default function ProfilePage() {
	const { getProfile, uploadPost, getPosts, getProfileId } = useLens();
	const [handleName, setHandleName] = useState("");
	const [profileId, setProfileId] = useState("");
	const [profile, setProfile] = useState<any>();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [posts, setPosts] = useState();

	const { address } = useAccount();
	const { data: signer } = useSigner();

	const handleGetProfile = async () => {
		const res = await getProfile(handleName + ".test");
		console.log(res);
		setProfile(res);
		handleGetProfileId();
	};

	const handleGetProfileId = async () => {
		const res = await getProfileId(handleName);
		setProfileId(res);
	};

	const handleCreateNewPost = async () => {
		if (!profile) return;
		if (!profile.id) return;
		if (!signer) return;
		if (!address) return;
		const res = await uploadPost(
			profile.id,
			signer,
			address,
			title,
			content,
			"post",
			false
		);

		console.log(res);
	};

	const handleGetPosts = async () => {
		console.log("Profile ID", profileId);
		const res = await getPosts(profileId);
		setPosts(res);
		console.log(posts);
	};

	return (
		<div>
			<h1 className="text-3xl mx-5">Profile Page</h1>
			<label className="mx-5">Enter your lens handle</label>
			<input
				className="border-2 rounded-lg w-96 h-8 p-2"
				placeholder="Enter handle name without .test"
				onChange={(e) => setHandleName(e.target.value)}
			/>
			<button
				className="ml-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full"
				onClick={handleGetProfile}
			>
				Enter
			</button>

			{profile && (
				<div className="p-5">
					<ul>
						<li className="text-2xl">
							Profile Handle: {profile.handle}
						</li>
						{profile.picture && (
							// <img
							// 	className="h-full w-full"
							// 	src={profile.picture.original.url}
							// />

							<img
								src={profile.picture.original.url}
								width={70}
								height={100}
							/>
						)}

						<li>Profile ID: {profile.id}</li>
						<li>Owner: {profile.ownedBy}</li>
						<ul className="flex gap-5">
							<li>Followers : {profile.stats.totalFollowers}</li>
							<li>Following : {profile.stats.totalFollowing}</li>
							<li>Posts : {profile.stats.totalPosts}</li>
						</ul>
					</ul>
					<div className="mt-5 flex flex-col">
						<h1 className="text-3xl">Create New Post</h1>
						<label className="">Title</label>
						<input
							className="border-2 rounded-lg w-96 h-8 p-2"
							placeholder="Enter the title of your post"
							onChange={(e) => setTitle(e.target.value)}
						/>

						<label className="">Content</label>
						<textarea
							className="border-2 rounded-lg w-96 p-2"
							placeholder="Enter content of your post"
							cols={15}
							onChange={(e) => setContent(e.target.value)}
						></textarea>
						<button
							className="mt-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full"
							onClick={handleCreateNewPost}
						>
							Create New Post
						</button>
					</div>

					<div className="mt-5">
						<h1 className="text-3xl">{profile.handle} Posts</h1>
						<button
							className="mt-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full"
							onClick={handleGetPosts}
						>
							View Posts
						</button>

						<div>
							{posts &&
								posts.map((post, index) => (
									<div key={index}>
										<h1 className="text-3xl">
											{post.metadata.name}
										</h1>
										<h1>{post.metadata.content}</h1>
									</div>
								))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
