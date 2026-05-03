// src/server.js (FINAL VERSION - WORKS LOCALLY AND ON VERCEL)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import { app } from "./app.js";

// Load environment variables reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, "./.env"),
});

// Connect to the database
await connectDB();

if (!process.env.VERCEL) {
  const DEFAULT_PORT = 8000;
  const PORT = Number(process.env.PORT) || DEFAULT_PORT;
  const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing process or update PORT in backend_vedant/.env.`
      );
      process.exit(1);
    }

    throw error;
  });
}

export default app;
