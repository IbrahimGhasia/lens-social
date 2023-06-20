"use client";
import { Signer } from "ethers";
import useLens from "./hooks/useLens";
import { useSigner, useAccount } from "wagmi";
import { get } from "http";
import { useEffect } from "react";

export default function Home() {
	const { getRecommendedProfilesRequest, follow, unfollow } = useLens();
	const { address } = useAccount();
	const { data: signer } = useSigner();

	useEffect(() => {
		getProfiles();
	}, []);

	const getProfiles = async () => {
		const profiles = await getRecommendedProfilesRequest();
		// console.log(profiles);
	};

	const handleFollow = async () => {
		const res1 = await follow("0x8669", address, signer);
		console.log(res1);
	};

	const handleUnFollow = async () => {
		const res = await unfollow("0x8669", address, signer);
		console.log("Finale Result", res);
	};

	return (
		<div>
			<h1 className="text-center text-3xl">Lens Social</h1>
			<button className="border-2 p-2" onClick={handleFollow}>
				Follow
			</button>

			<button className="border-2 p-2" onClick={handleUnFollow}>
				UnFollow
			</button>
		</div>
	);
}
