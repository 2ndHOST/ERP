import axios from 'axios'
import Cookies from 'js-cookie'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug log for development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api')
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
}

// Admissions API
export const admissionsAPI = {
  getAll: () => api.get('/admissions'),
  getById: (id) => api.get(`/admissions/${id}`),
  create: (data) => api.post('/admissions', data),
  update: (id, data) => api.put(`/admissions/${id}`, data),
  delete: (id) => api.delete(`/admissions/${id}`),
}

// Fees API
export const feesAPI = {
  getAll: (params = {}) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  getReceipt: (id) => api.get(`/fees/${id}/receipt`),
}

// Hostel API
export const hostelAPI = {
  getAll: () => api.get('/hostel'),
  getByStudentId: (studentId) => api.get(`/hostel/student/${studentId}`),
  create: (data) => api.post('/hostel', data),
  deallocate: (id) => api.put(`/hostel/${id}/deallocate`),
}

// Dashboard API
export const dashboardAPI = {
  getAdminDashboard: () => api.get('/dashboard'),
  getStudentDashboard: () => api.get('/dashboard/student'),
}

// Blockchain API
export const blockchainAPI = {
  verify: () => api.get('/blockchain/verify'),
  getStatus: () => api.get('/blockchain/status'),
  getBlock: (hash) => api.get(`/blockchain/block/${hash}`),
  getBlocksByType: (type, params = {}) => api.get(`/blockchain/blocks/${type}`, { params }),
}

export default api
