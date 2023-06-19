import { NextResponse } from "next/server";
const { Web3Storage, File } = require("web3.storage");

export async function POST(req: Request) {
	// const title = req.body.title
	// const description = req.body.description
	// const images = req.body.images
	console.log("uploading json to ipfs");
	const client = new Web3Storage({
		token: process.env.WEB3STORAGE_TOKEN,
	});
	const obj = await req.json();
	console.log("req object", obj);

	const buffer = Buffer.from(JSON.stringify(obj));
	const files = [new File([buffer], "data.json")];

	const cid = await client.put(files);
	console.log("uploaded json to ipfs: ", cid);
	return NextResponse.json({ cid: cid });
}
