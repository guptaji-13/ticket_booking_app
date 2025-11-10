import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as routes from "./routes/index.route.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/events", routes.EventsRoute);
app.use("/api/venues", routes.VenuesRoute);
app.use("/api/shows", routes.ShowsRoute);

export default app;
