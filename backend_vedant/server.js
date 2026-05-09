import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "./.env"),
  override: true,
});

const [{ default: connectDB }, { app }] = await Promise.all([
  import("./config/database.js"),
  import("./app.js"),
]);

const PORT = Number(process.env.PORT) || 8000;
const DB_RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS) || 10000;
const EXIT_ON_DB_FAILURE = process.env.NODE_ENV === "production";

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Database startup failed:", error);

    if (EXIT_ON_DB_FAILURE) {
      server.close(() => process.exit(1));
      return;
    }

    console.error(
      `Server is still running. Retrying MongoDB connection in ${DB_RETRY_DELAY_MS}ms...`
    );
    setTimeout(connectWithRetry, DB_RETRY_DELAY_MS);
  }
};

connectWithRetry();

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  }

  console.error("Server error:", error);
});
