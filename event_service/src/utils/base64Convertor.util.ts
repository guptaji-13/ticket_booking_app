import zlib from "zlib";

export const base64ToJson = (data: string) => {
	const json = JSON.parse(zlib.gunzipSync(Buffer.from(data, "base64")).toString());
	return json;
};

export const jsonToBase64 = (json: any) => {
	const compressed = zlib.gzipSync(JSON.stringify(json)).toString("base64");
	return compressed;
};
