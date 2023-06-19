"use client";
import { useEffect } from "react";
import useLens from "../hooks/useLens";

export default function ProfilePage() {
	const { getProfile } = useLens();

	const handleGetProfile = async () => {
		const res = await getProfile("crazyibo.test");
		console.log(res);
	};

	useEffect(() => {
		handleGetProfile();
	}, []);
	return <div>Profile Page</div>;
}
