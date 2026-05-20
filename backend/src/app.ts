import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { leadRouter } from "./routes/lead.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/leads", leadRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);
