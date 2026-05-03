import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host} | DB NAME: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
