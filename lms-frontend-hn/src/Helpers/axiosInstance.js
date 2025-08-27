// axiosInstance.js or wherever you configure axios
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method?.toUpperCase(), config.url);
    console.log('Request config:', {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.statusText);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;