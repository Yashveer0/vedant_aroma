import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";

dotenv.config();

const hasValidS3Config = [
  process.env.AWS_REGION,
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY,
  process.env.AWS_BUCKET_NAME,
].every((value) => value && !String(value).startsWith("your_"));

const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");
const LOCAL_UPLOAD_PREFIX = "uploads";
const DEFAULT_PORT = 8000;

const getServerBaseUrl = () =>
  process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || DEFAULT_PORT}`;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const saveLocally = (localFilePath, folder) => {
  const fileExt = path.extname(localFilePath);
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const fileName = `${Date.now()}_${randomBytes}${fileExt}`;
  const relativeDir = path.posix.join(LOCAL_UPLOAD_PREFIX, folder);
  const absoluteDir = path.join(LOCAL_UPLOAD_DIR, folder);
  const absolutePath = path.join(absoluteDir, fileName);
  const relativePath = path.posix.join(relativeDir, fileName);

  fs.mkdirSync(absoluteDir, { recursive: true });
  fs.copyFileSync(localFilePath, absolutePath);
  fs.unlinkSync(localFilePath);

  return {
    url: `${getServerBaseUrl()}/${relativePath}`,
    key: relativePath,
  };
};

const uploadOnS3 = async (localFilePath, folder) => {
  try {
    if (!localFilePath) return null;

    if (!hasValidS3Config) {
      return saveLocally(localFilePath, folder);
    }

    const fileStream = fs.createReadStream(localFilePath);
    const fileExt = path.extname(localFilePath);
    
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const objectKey = `${folder}/${Date.now()}_${randomBytes}${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: fileStream,
    });

    await s3Client.send(command);

    
    const objectUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
    
    fs.unlinkSync(localFilePath); 
    return { url: objectUrl, key: objectKey };

  } catch (error) {
    console.error("S3 Upload Error:", error);
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromS3 = async (objectKey) => {
  try {
    if (!objectKey) return false;

    if (objectKey.startsWith(`${LOCAL_UPLOAD_PREFIX}/`)) {
      const localPath = path.resolve(process.cwd(), "public", objectKey);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return true;
    }

    if (!hasValidS3Config) {
      return true;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted ${objectKey} from S3.`);
    return true;

  } catch (error) {
    if (error.name !== 'NoSuchKey') {
      console.error("S3 Deletion Error:", error);
    }
    return true;
  }
};


const getObjectKeyFromUrl = (url) => {
  if (!url) return "";
  try {
    const urlObject = new URL(url);
    return urlObject.pathname.substring(1);
  } catch (error) {
    console.error("Could not extract Object Key from URL:", url, error);
    return "";
  }
};

export { uploadOnS3, deleteFromS3, getObjectKeyFromUrl };
