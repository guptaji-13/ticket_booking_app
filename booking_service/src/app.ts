import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as routes from "./routes/index.route.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/bookings", routes.BookingsRoute);
app.use("/api/payments", routes.PaymentsRoute);
app.use("/api/users", routes.UsersRoute);
app.use("/api/auth", routes.AuthRoute);

export default app;
