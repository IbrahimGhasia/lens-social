"use client";
import { useState } from "react";
import useLens from "../hooks/useLens";
import { useAccount } from "wagmi";
import { useSigner } from "wagmi";
import Link from "next/link";

export default function IndexPage() {
	const { address } = useAccount();
	const { data: signer } = useSigner();
	const { profileExists, login } = useLens();

	const [handleName, setHandleName] = useState<String>();
	const [profileExist, setProfileExist] = useState<Boolean>(false);

	const handleCheckProfileExists = async () => {
		const res = await profileExists(handleName);
		setProfileExist(res);
		if (res === false) {
			alert("Profile does not exist");
		}
	};

	const handleLogin = async () => {
		if (!address) {
			alert("Please connect your wallet");
			return;
		}

		const res = await login(address, signer);
		console.log("Result", res);
	};

	return (
		<div>
			<h1 className="text-center mt-5 text-4xl">
				Login to your Lens Profile
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

				{profileExist && (
					<div>
						<Link href={"/ProfilePage"}>
							<button
								className="ml-5 w-44 bg-green-500 mt-5 text-white border-2 p-2 rounded-full"
								onClick={handleLogin}
							>
								Login to your profile
							</button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
