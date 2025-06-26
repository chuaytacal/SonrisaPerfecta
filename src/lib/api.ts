
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Recommended to use an environment variable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request.
// NOTE: The current login system uses httpOnly cookies and does not provide a token
// to the client. For this interceptor to work, you would need to adjust the
// login flow to store a bearer token in a place accessible by the client,
// like localStorage.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
