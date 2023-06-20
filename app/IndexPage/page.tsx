"use client";
import { useState, useEffect } from "react";
import useLens from "../hooks/useLens";
import { useAccount } from "wagmi";
import { useSigner } from "wagmi";
import Link from "next/link";

export default function IndexPage() {
	const { address } = useAccount();
	const { data: signer } = useSigner();
	const { profileExists, createProfile } = useLens();

	const [handleName, setHandleName] = useState<String>();
	const [profileExist, setProfileExist] = useState<Boolean>(false);

	const handleCheckProfileExists = async () => {
		const res = await profileExists(handleName);
		setProfileExist(res);
		if (res === false) {
			alert("Profile does not exist");
		}
	};

	const handleCreateNewProfile = async () => {
		console.log("Hello");
		if (!address) {
			alert("Please connect your wallet");
			return;
		}
		const res = await createProfile(handleName + ".test", address, signer);
		console.log(res);
	};

	return (
		<div>
			<h1 className="text-center mt-5 text-4xl">
				Check if your lens profile exists or not.
			</h1>
			<div className="mt-5">
				<label className="mx-5">Enter your lens handle</label>
				<input
					className="border-2 rounded-lg w-96 h-8 p-2"
					placeholder="Enter handle name without .test"
					onChange={(e) => setHandleName(e.target.value)}
				/>
				<button
					className="ml-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full"
					onClick={handleCheckProfileExists}
				>
					Check
				</button>

				{!profileExist && (
					<div className="mt-5">
						<button
							className="ml-5 w-44 bg-yellow-500 text-white border-2 p-2 rounded-full"
							onClick={handleCreateNewProfile}
						>
							Create a new profile
						</button>
					</div>
				)}

				{profileExist && (
					<div>
						<h1 className="text-3xl text-green-500 p-5">
							Profile Exists
						</h1>
						<Link href={"/ProfilePage"}>
							<button className="ml-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full">
								Go to Profile
							</button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
