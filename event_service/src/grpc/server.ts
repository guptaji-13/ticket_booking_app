import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { showsGrpcService } from "./services/shows.grpc.service.js";
import path from "path";

const PROTO_PATH = path.resolve("/protos/event_service.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const eventPackage = grpcObj.event;

export const startGrpcServer = () => {
	const server = new grpc.Server();

	server.addService(eventPackage.EventService.service, showsGrpcService);

	server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
		console.log("✅ gRPC Event Service running on port 50051");
	});
};
