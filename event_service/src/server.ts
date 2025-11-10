import app from "./app.js";
import http from "http";
import { startGrpcServer } from "./grpc/server.js";

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
	console.log(`✅ HTTP server running at http://localhost:${PORT}`);
});

startGrpcServer();
