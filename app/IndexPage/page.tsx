"use client";
import { useState } from "react";
import useLens from "../hooks/useLens";
import Link from "next/link";

export default function IndexPage() {
	const { profileExists } = useLens();

	const [handleName, setHandleName] = useState("");
	const [profileExist, setProfileExist] = useState(false);

	const handleCheckProfileExists = async () => {
		const res = await profileExists(handleName);
		setProfileExist(res);
		if (res === false) {
			alert("Profile does not exist");
		}
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
