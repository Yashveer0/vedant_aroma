import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import mainRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://72.60.101.227:3000",   
  "http://72.60.101.227:3001",   
  "https://vedant-fe.vercel.app",
  "https://www.vedantgurukul.com",
  "https://vedantgurukul.com",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cookieParser());

app.use(express.static(publicDir));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting",
  });
});

app.use("/api/v1", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is still connecting. Please retry shortly.",
    });
  }

  next();
});

app.use("/api/v1", mainRouter);

app.use(errorHandler);

export { app };
