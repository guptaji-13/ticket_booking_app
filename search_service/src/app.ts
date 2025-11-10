import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import searchRoutes from "./routes/shows.route.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", searchRoutes);

export default app;
