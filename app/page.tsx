"use client";
import { Signer } from "ethers";
import useLens from "./hooks/useLens";
import { useSigner, useAccount } from "wagmi";
import { get } from "http";
import { useEffect } from "react";

export default function Home() {
	const { getRecommendedProfilesRequest, follow, login } = useLens();
	const { address } = useAccount();
	const { data: signer } = useSigner();

	useEffect(() => {
		getProfiles();
	}, []);

	const getProfiles = async () => {
		const profiles = await getRecommendedProfilesRequest();
		// console.log(profiles);
	};

	const handleLogin = async () => {
		// const res = await login(address, signer);
		const res1 = await follow("0x8669", address, signer);
		console.log(res1);
	};

	return (
		<div>
			<h1 className="text-center text-3xl">Lens Social</h1>
			<button className="border-2 p-2" onClick={handleLogin}>
				Login
			</button>
		</div>
	);
}
