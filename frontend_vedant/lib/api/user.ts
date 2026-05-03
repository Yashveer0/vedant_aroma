import axios from 'axios';
import { USERS_API_BASE_URL } from '@/lib/api/config';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: USERS_API_BASE_URL,
  withCredentials: true, // Important for sending cookies with requests
});

export default api;
