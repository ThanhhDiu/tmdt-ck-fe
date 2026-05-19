import axios from 'axios';
import { getAccessToken } from '../services/auth';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Request: Add Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for Response: Handle errors globally if needed
axiosClient.interceptors.response.use(
  (response) => {
    // You can unwrap response data here if your API always wraps it in { data: ... }
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized, maybe logout user or refresh token
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
