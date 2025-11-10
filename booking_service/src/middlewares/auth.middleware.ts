import jwt from "jsonwebtoken";

export function authMiddleware(req: any, res: any, next: any) {
	const header = req.headers.authorization;
	if (!header) return res.status(401).json({ message: "Missing auth header" });

	const token = header.split(" ")[1];
	if (!token) return res.status(401).json({ message: "Missing token" });
	console.log("here");
	try {
		const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}
