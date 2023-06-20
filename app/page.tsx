"use client";
import useLens from "./hooks/useLens";
import { useSigner, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Profile from "./components/Profile";

export default function Home() {
	const { getRecommendedProfilesRequest, follow, unfollow } = useLens();
	const [profiles, setProfiles] = useState([{}]);
	const { address } = useAccount();
	const { data: signer } = useSigner();

	useEffect(() => {
		getProfiles();
	}, []);

	const getProfiles = async () => {
		const res = await getRecommendedProfilesRequest();
		setProfiles(res);
		console.log(res);
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
			{/* <button className="border-2 p-2" onClick={handleFollow}>
				Follow
			</button>

			<button className="border-2 p-2" onClick={handleUnFollow}>
				UnFollow
			</button> */}
			{profiles.length > 0 ? (
				<div className="px-20">
					{profiles.map((profile, index) => (
						<Profile key={index} props={profile} />
					))}
				</div>
			) : (
				<p>Loading profiles ...</p>
			)}
		</div>
	);
}
