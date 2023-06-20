"use client";

import { useState } from "react";
import useLens from "../hooks/useLens";
import { useAccount } from "wagmi";
import { useSigner } from "wagmi";

export default function NewProfile() {
	const [handleName, setHandleName] = useState("");

	const { address } = useAccount();
	const { data: signer } = useSigner();
	const { createProfile } = useLens();

	const handleCreateNewProfile = async () => {
		console.log("Hello");
		if (!address) {
			alert("Please connect your wallet");
			return;
		}
		const res = await createProfile(handleName + ".test", address, signer);
		alert("Profile created successfully");
		console.log(res);
	};

	return (
		<div className="mt-5">
			<label className="mx-5">
				Enter the handle name you want to create
			</label>
			<input
				className="border-2 rounded-lg w-96 h-8 p-2"
				placeholder="Enter handle name without .test"
				onChange={(e) => setHandleName(e.target.value)}
			/>

			<button
				className="ml-5 w-44 bg-green-500 text-white border-2 p-2 rounded-full"
				onClick={handleCreateNewProfile}
			>
				Create a new profile
			</button>
		</div>
	);
}
