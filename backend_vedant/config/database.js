import mongoose from "mongoose";

const getMongoDbHost = (uri) => {
  try {
    return new URL(uri).hostname;
  } catch {
    return "unknown-host";
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const timeoutMs =
    Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 30000;

  console.log(`MongoDB connecting via host: ${getMongoDbHost(mongoUri)}`);

  const connectionInstance = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: timeoutMs,
    connectTimeoutMS: timeoutMs,
    socketTimeoutMS: timeoutMs,
  });

  console.log(
    `\n MongoDB Connected !! DB HOST: ${
      connectionInstance.connection.host || "unknown-host"
    } | DB NAME: ${connectionInstance.connection.name || "unknown-db"}`
  );
};

export default connectDB;
