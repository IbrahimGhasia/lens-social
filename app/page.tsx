"use client";
import { Signer } from "ethers";
import useLens from "./hooks/useLens";
import { useSigner, useAccount } from "wagmi";
import { get } from "http";

export default function Home() {
	const { login, createProfile, uploadPost, getPosts } = useLens();
	const { address } = useAccount();
	const { data: signer } = useSigner();

	const handleLogin = async () => {
		const res = await login(address, signer);
		console.log("Result", res);
	};

	const handleCreateNewProfile = async () => {
		const res = await createProfile("ibo16", address, signer);
		console.log(res);
	};

	const handleCreatePost = async () => {
		if (!signer) return;
		if (!address) return;

		const res = await uploadPost(
			"0x5bd7",
			signer,
			address,
			"Hello1",
			"This is test2",
			"post",
			false
		);

		console.log(res);
	};

	const handleGetPost = async () => {
		const res = await getPosts("0x5bd7");
		console.log(res);
	};

	return (
		<div>
			<h1 className="text-center text-3xl">Lens Social</h1>
			<button className="border-2 p-3" onClick={handleLogin}>
				LogIn
			</button>

			<button className="border-2 p-3" onClick={handleCreateNewProfile}>
				Create Profile
			</button>

			<button className="border-2 p-3" onClick={handleCreatePost}>
				Create Post
			</button>

			<button className="border-2 p-3" onClick={handleGetPost}>
				Get Post
			</button>
		</div>
	);
}
