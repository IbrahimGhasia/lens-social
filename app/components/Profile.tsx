"use client";
import useLens from "../hooks/useLens";
import { useSigner, useAccount } from "wagmi";

export default function Profile({ props }: any) {
	const { address } = useAccount();
	const { data: signer } = useSigner();
	const { follow, unfollow } = useLens();

	const handleFollow = async () => {
		const res1 = await follow(props.id, address, signer);
		console.log(res1);
	};

	const handleUnFollow = async () => {
		const res = await unfollow(props.id, address, signer);
		console.log("Finale Result", res);
	};

	return (
		<div className="border-2 p-5 border-black mt-5">
			<h1 className="text-3xl">{props.handle}</h1>
			<div className="flex gap-10 mt-5">
				<div>
					<img
						className="h-48 w-48 rounded-full"
						src={props.picture?.original.url}
					/>
				</div>
				<div>
					<p className="text-xl">{props.bio}</p>
					<p className="text-lg">Profile ID: {props.id}</p>

					<div className="flex gap-5 text-2xl text-center mt-5">
						<div>
							<p>Followers</p>
							<p>{props.stats?.totalFollowers}</p>
						</div>
						<div>
							<p>Following</p>
							<p>{props.stats?.totalFollowing}</p>
						</div>
						<div>
							<p>Posts</p>
							<p>{props.stats?.totalPosts}</p>
						</div>
					</div>
					<div className="mt-5 flex gap-5">
						<button
							className="p-3 border-2 rounded-full bg-green-500 w-24"
							onClick={handleFollow}
						>
							Follow
						</button>

						<button
							className="p-3 border-2 rounded-full bg-yellow-500 w-24"
							onClick={handleUnFollow}
						>
							Unfollow
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
