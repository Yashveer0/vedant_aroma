import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(BACKEND_ROOT, "public");
const LOCAL_UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const LOCAL_UPLOAD_PREFIX = "uploads";

const hasValidS3Config = [
  process.env.AWS_REGION,
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY,
  process.env.AWS_BUCKET_NAME,
].every((value) => value && !String(value).startsWith("your_"));

const shouldUseS3 = process.env.UPLOAD_STORAGE === "s3" && hasValidS3Config;

const s3Client = shouldUseS3
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const normalizeFolderName = (folder = "misc") =>
  String(folder).replace(/[^a-zA-Z0-9_-]/g, "-") || "misc";

const normalizeObjectKey = (value = "") => {
  if (!value) return "";

  try {
    const parsedUrl = new URL(value);
    return decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, "");
  } catch {
    return decodeURIComponent(String(value)).replace(/^\/+/, "");
  }
};

const saveLocally = (localFilePath, folder) => {
  const safeFolder = normalizeFolderName(folder);
  const fileExt = path.extname(localFilePath);
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const fileName = `${Date.now()}_${randomBytes}${fileExt}`;
  const relativeDir = path.posix.join(LOCAL_UPLOAD_PREFIX, safeFolder);
  const absoluteDir = path.join(LOCAL_UPLOAD_DIR, safeFolder);
  const absolutePath = path.join(absoluteDir, fileName);
  const relativePath = path.posix.join(relativeDir, fileName);

  fs.mkdirSync(absoluteDir, { recursive: true });
  fs.copyFileSync(localFilePath, absolutePath);
  fs.unlinkSync(localFilePath);

  return {
    url: `/${relativePath}`,
    key: relativePath,
  };
};

const uploadOnS3 = async (localFilePath, folder) => {
  try {
    if (!localFilePath) return null;

    if (!shouldUseS3) {
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
    console.error("File upload error:", error);
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromS3 = async (objectKey) => {
  try {
    if (!objectKey) return false;

    const normalizedKey = normalizeObjectKey(objectKey);

    if (normalizedKey.startsWith(`${LOCAL_UPLOAD_PREFIX}/`)) {
      const localPath = path.resolve(PUBLIC_DIR, normalizedKey);
      const publicRootWithSeparator = `${path.resolve(PUBLIC_DIR)}${path.sep}`;

      if (!localPath.startsWith(publicRootWithSeparator)) {
        return false;
      }

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return true;
    }

    if (!shouldUseS3) {
      return true;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: normalizedKey,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted ${normalizedKey} from S3.`);
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
  return normalizeObjectKey(url);
};

export { uploadOnS3, deleteFromS3, getObjectKeyFromUrl };
