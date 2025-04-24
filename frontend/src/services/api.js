import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', error.response || error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// User service for handling user management
export const userService = {
  // Create or update user
  createOrUpdateUser: (userData) => api.post('/users', userData),
  
  // Get user by ID
  getUserById: (uid) => api.get(`/users/${uid}`),
  
  // Update profile picture
  updateProfilePicture: (uid, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return axios.post(`${API_URL}/users/${uid}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get all users (admin only)
  getAllUsers: (page = 1, limit = 10) => api.get(`/users?page=${page}&limit=${limit}`),
  
  // Get users by role
  getUsersByRole: (role, page = 1, limit = 10) => api.get(`/users/role/${role}?page=${page}&limit=${limit}`),
  
  // Update user role
  updateUserRole: (uid, role) => api.put(`/users/${uid}/role`, { role }),
};

// Report service for handling missing children reports
export const reportService = {
  // Create new report
  createReport: (reportData) => api.post('/reports', reportData),
  
  // Get all reports with pagination
  getAllReports: (page = 1, limit = 10) => api.get(`/reports?page=${page}&limit=${limit}`),
  
  // Get report by ID
  getReportById: (id) => api.get(`/reports/${id}`),
  
  // Get reports by status with pagination
  getReportsByStatus: (status, page = 1, limit = 10) => 
    api.get(`/reports/status/${status}?page=${page}&limit=${limit}`),
  
  // Get reports by user with pagination
  getReportsByUser: (uid, page = 1, limit = 10) => 
    api.get(`/reports/user/${uid}?page=${page}&limit=${limit}`),
  
  // Search reports by location with pagination
  searchReportsByLocation: (longitude, latitude, radius, page = 1, limit = 10) => 
    api.get(`/reports/search/location?longitude=${longitude}&latitude=${latitude}&radius=${radius}&page=${page}&limit=${limit}`),
  
  // Update report
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),
  
  // Delete report
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// Enquiry service for handling enquiries about missing children
export const enquiryService = {
  // Create new enquiry
  createEnquiry: (enquiryData) => api.post('/enquiries', enquiryData),
  
  // Get all enquiries with pagination
  getAllEnquiries: (page = 1, limit = 10) => api.get(`/enquiries?page=${page}&limit=${limit}`),
  
  // Get enquiry by ID
  getEnquiryById: (id) => api.get(`/enquiries/${id}`),
  
  // Get enquiries by report with pagination
  getEnquiriesByReport: (reportId, page = 1, limit = 10) => 
    api.get(`/enquiries/report/${reportId}?page=${page}&limit=${limit}`),
  
  // Get enquiries by user with pagination
  getEnquiriesByUser: (uid, page = 1, limit = 10) => 
    api.get(`/enquiries/user/${uid}?page=${page}&limit=${limit}`),
  
  // Update enquiry
  updateEnquiry: (id, enquiryData) => api.put(`/enquiries/${id}`, enquiryData),
  
  // Delete enquiry
  deleteEnquiry: (id) => api.delete(`/enquiries/${id}`),
  
  // Respond to enquiry
  respondToEnquiry: (id, responseData) => api.post(`/enquiries/${id}/respond`, responseData),
};

// Image service for handling image uploads and retrievals
export const imageService = {
  // Upload image
  uploadImage: (imageFile, userId) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (userId) {
      formData.append('userId', userId);
    }
    
    return axios.post(`${API_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get image URL - for Cloudinary, we can directly use the URL returned from the server
  getImageUrl: (imageUrl, imageId) => {
    // If full URL is provided, use it directly (Cloudinary)
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Fall back to the old method using imageId if needed
    return imageId ? `${API_URL}/images/${imageId}` : null;
  },
  
  // Delete image
  deleteImage: (imageId) => api.delete(`/images/${imageId}`),
};

export default api;