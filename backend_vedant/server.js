import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "./.env"),
});

const [{ default: connectDB }, { app }] = await Promise.all([
  import("./config/database.js"),
  import("./app.js"),
]);

const PORT = Number(process.env.PORT) || 8000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

connectDB().catch((error) => {
  console.error("Database startup failed:", error);
  server.close(() => process.exit(1));
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  }

  console.error("Server error:", error);
});
