import axios from 'axios';
import toast from 'react-hot-toast';

let token = null;

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to inject Authorization token
client.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally via toast
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'Something went wrong';
    
    // Auto toast backend errors
    if (error.response && error.response.status !== 404) {
      toast.error(errorMsg);
    }
    
    return Promise.reject(error);
  }
);

export const setClientToken = (newToken) => {
  token = newToken;
};

export default client;
export { client };
