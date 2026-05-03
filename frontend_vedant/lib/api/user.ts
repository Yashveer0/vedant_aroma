import axios from 'axios';

// Create an Axios instance with default settings
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
  withCredentials: true, // Important for sending cookies with requests
});

export default api;