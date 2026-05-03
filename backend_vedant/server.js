import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import { app } from "./app.js";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({
  path: path.resolve(__dirname, "./.env"),
});

// Connect DB
await connectDB();

// PORT setup
const PORT = Number(process.env.PORT) || 8000;

// START SERVER (IMPORTANT: 0.0.0.0 binding)
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});

// Error handling
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use`);
    process.exit(1);
  }
  console.error("❌ Server error:", error);
});