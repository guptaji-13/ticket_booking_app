import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve("/protos/event_service.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const eventPackage = grpcObj.event;

const HOST = process.env.GRPC_SERVER_HOST;
const PORT = process.env.GRPC_SERVER_PORT;

const client = new eventPackage.EventService(
	`${HOST}:${PORT}`, // Docker service name!
	grpc.credentials.createInsecure()
);

export default client;
