import mongoose from "mongoose";

const getMongoDbHost = (uri) => {
  try {
    return new URL(uri).hostname;
  } catch {
    return "unknown-host";
  }
};

const connectDB = async () => {
  let timeoutId;

  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const timeoutMs =
      Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 10000;

    console.log(`MongoDB connecting via host: ${getMongoDbHost(mongoUri)}`);

    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    const connectionInstance = await Promise.race([
      mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
        socketTimeoutMS: timeoutMs,
      }),
      timeout,
    ]);

    clearTimeout(timeoutId);
    console.log(
      `\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host} | DB NAME: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export default connectDB;
