import axios from "axios";
import { ApiError } from "./ApiError.js";

let shiprocketToken = null;
let tokenExpiryTime = null;

const SHIPROCKET_BASE_URL =
  process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in/v1/external";

const getShiprocketCredentials = () => {
  const email = process.env.SHIPROCKET_API_EMAIL || process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD || process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new ApiError(
      500,
      "Shiprocket API credentials are not configured. Please set SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD."
    );
  }

  return { email, password };
};

const getAuthToken = async () => {
  if (shiprocketToken && new Date() < tokenExpiryTime) {
    return shiprocketToken;
  }

  try {
    const credentials = getShiprocketCredentials();
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, credentials, {
      timeout: Number(process.env.SHIPROCKET_TIMEOUT_MS) || 15000,
    });

    if (!response.data?.token) {
      throw new Error("No token found in Shiprocket auth response.");
    }

    shiprocketToken = response.data.token;
    tokenExpiryTime = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000);
    return shiprocketToken;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Shiprocket authentication failed:", error.response?.data || error.message);
    throw new ApiError(502, "Could not authenticate with Shiprocket.");
  }
};

export const shiprocketApi = axios.create({
  baseURL: SHIPROCKET_BASE_URL,
  timeout: Number(process.env.SHIPROCKET_TIMEOUT_MS) || 15000,
});

shiprocketApi.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

shiprocketApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      shiprocketToken = null;
      tokenExpiryTime = null;
    }

    return Promise.reject(error);
  }
);
