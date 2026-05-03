import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const timeoutMs =
      Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 10000;

    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    const connectionInstance = await Promise.race([
      mongoose.connect(process.env.MONGODB_URI, {
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
  }
};

export default connectDB;
