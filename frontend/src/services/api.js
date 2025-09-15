import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const emailAPI = {
  // Get email statistics
  getStats: () => api.get('/emails/stats'),
  
  // Get emails with filtering and pagination
  getEmails: (params) => api.get('/emails', { params }),
  
  // Process emails from Gmail
  processEmails: () => api.post('/emails/process'),
  
  // Update email tag
  updateEmailTag: (id, tag) => api.put(`/emails/${id}/tag`, { tag }),
  
  // Health check
  healthCheck: () => api.get('/health')
};

export default api;
