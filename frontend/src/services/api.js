import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://lost-and-found-children-reporting.vercel.app/api';

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

// Form service for handling form operations
export const formService = {
  // Get all forms
  getAllForms: () => {
    console.log('Fetching all forms from database...', `${API_URL}/reports`);
    
    // Test connection to API endpoint
    console.log('Testing API connection to:', API_URL);
    
    return axios.get(`${API_URL}/reports`)
      .then(response => {
        console.log('Retrieved forms response:', response);
        // Handle different response formats consistently
        let forms = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            console.log('Data is an array');
            forms = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            console.log('Data is in response.data.data array');
            forms = response.data.data;
          } else if (response.data.success && response.data.data) {
            console.log('Data is in response.data.data with success flag');
            forms = response.data.data;
          } else {
            // Fallback - just return what we have
            console.log('Using fallback data format');
            forms = response.data;
          }
        }
        
        console.log('Parsed forms data:', forms);
        return forms;
      })
      .catch(error => {
        console.error('Error fetching forms:', error.response || error);
        console.log('API URL being used:', API_URL);
        console.log('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          method: 'GET',
          url: `${API_URL}/reports`
        });
        throw error;
      });
  },
  
  // Get forms by user ID
  getMyForms: (userId) => {
    console.log('Fetching forms for user:', userId, `${API_URL}/reports/user/${userId}`);
    return axios.get(`${API_URL}/reports/user/${userId}`)
      .then(response => {
        console.log('Retrieved user forms response:', response);
        return response.data.data || response.data;
      })
      .catch(error => {
        console.error('Error fetching user forms:', error.response || error);
        throw error;
      });
  },
  
  // Create a new form (used by CreateForm component)
  createForm: (formData) => {
    console.log('Creating new form in MongoDB:', formData);
    
    // Debug info
    console.log('API URL being used:', `${API_URL}/reports`);
    console.log('Form data keys:', Object.keys(formData));
    
    return axios.post(`${API_URL}/reports`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 seconds timeout for better error handling
    })
    .then(response => {
      console.log('Form created successfully, response:', response);
      // After form creation, dispatch an event to notify other components
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { source: 'create', form: response.data }
      }));
      return response.data;
    })
    .catch(error => {
      console.error('Error creating form:', error);
      console.error('Error details:', {
        url: error.config?.url,
        data: error.config?.data,
        method: error.config?.method,
        headers: error.config?.headers,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    });
  },
  
  // Submit a new form
  submitForm: (formData) => {
    console.log('Submitting form to database:', formData, `${API_URL}/reports`);
    return axios.post(`${API_URL}/reports`, formData, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      console.log('Form submitted successfully, response:', response);
      // After form submission, dispatch an event to notify other components
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { source: 'create', form: response.data }
      }));
      return response.data;
    })
    .catch(error => {
      console.error('Error submitting form:', error.response || error);
      throw error;
    });
  },
  
  // Update form status
  updateFormStatus: (formId, status) => {
    console.log('Updating form status in database:', { formId, status }, `${API_URL}/reports/${formId}`);
    return axios.put(`${API_URL}/reports/${formId}`, { status }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      console.log('Form status updated in database, response:', response);
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { source: 'statusUpdate', formId, status }
      }));
      return response.data;
    })
    .catch(error => {
      console.error('Error updating form status in database:', error.response || error);
      throw error;
    });
  },
  
  // Delete form
  deleteForm: (formId) => {
    console.log('Deleting form from database:', formId, `${API_URL}/reports/${formId}`);
    return axios.delete(`${API_URL}/reports/${formId}`)
      .then(response => {
        console.log('Form deleted from database, response:', response);
        window.dispatchEvent(new CustomEvent('formsUpdated', { 
          detail: { source: 'delete', formId }
        }));
        return response.data;
      })
      .catch(error => {
        console.error('Error deleting form from database:', error.response || error);
        throw error;
      });
  },
  
  // Update form responses
  updateFormResponses: (formId, responses) => {
    console.log('Updating form responses in database:', { formId, responseCount: responses.length }, `${API_URL}/reports/${formId}`);
    return axios.put(`${API_URL}/reports/${formId}`, { responses }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      console.log('Form responses updated in database, response:', response);
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { source: 'responsesUpdate', formId, responses }
      }));
      return response.data;
    })
    .catch(error => {
      console.error('Error updating form responses in database:', error.response || error);
      throw error;
    });
  },
  
  // Update entire form
  updateForm: (formId, formData) => {
    console.log('Updating form in database:', { formId, formData }, `${API_URL}/reports/${formId}`);
    return axios.put(`${API_URL}/reports/${formId}`, formData, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      console.log('Form updated in database, response:', response);
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { source: 'formUpdate', formId, form: response.data }
      }));
      return response.data;
    })
    .catch(error => {
      console.error('Error updating form in database:', error.response || error);
      throw error;
    });
  },
  
  // Search forms
  searchForms: (params) => {
    let queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('childName', params.name);
    if (params.age) queryParams.append('childAge', params.age);
    if (params.location) queryParams.append('lastSeenLocation', params.location);
    
    const url = `${API_URL}/reports?${queryParams.toString()}`;
    console.log('Searching forms with params:', params, url);
    
    return axios.get(url)
      .then(response => {
        console.log('Search results response:', response);
        let results = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            results = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            results = response.data.data;
          } else if (response.data.success && response.data.data) {
            results = response.data.data;
          } else {
            results = response.data;
          }
        }
        
        console.log('Parsed search results:', results);
        return results;
      })
      .catch(error => {
        console.error('Error searching forms:', error.response || error);
        throw error;
      });
  }
};

// Image service for handling image uploads and retrievals
export const imageService = {
  // Upload image
  uploadImage: (imageFile, progressCallback) => {
    console.log('Uploading image to Cloudinary...', imageFile);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('timestamp', Date.now());
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    };
    
    if (typeof progressCallback === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progressCallback(percentCompleted);
      };
    }
    
    return axios.post(`${API_URL}/images/upload`, formData, config)
      .then(response => {
        console.log('Cloudinary upload success:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Cloudinary upload error:', error);
        throw new Error('Image upload failed: ' + (error.message || 'Unknown error'));
      });
  },
  
  // Get image URL
  getImageUrl: (imageUrl, imageId) => {
    console.log('Getting image URL from:', { imageUrl, imageId });
    
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
      return imageUrl;
    }
    
    if (imageUrl && imageUrl.secure_url) {
      return imageUrl.secure_url;
    }
    
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('cloudinary')) {
      return imageUrl;
    }
    
    if (imageId && typeof imageId === 'string') {
      if (imageId.includes('cloudinary') || imageId.includes('/')) {
        return imageId;
      }
      
      try {
        const cloudinaryBaseUrl = 'https://res.cloudinary.com/demo/image/upload/';
        return `${cloudinaryBaseUrl}${imageId}`;
      } catch (err) {
        console.error('Error constructing Cloudinary URL:', err);
      }
    }
    
    return imageId ? `${API_URL}/images/${imageId}` : null;
  },
  
  // Delete image
  deleteImage: (imageId) => api.delete(`/images/${imageId}`),
};

// Setup event-based real-time updates using server polling
let pollingInterval = null;

export const setupStorageListener = () => {
  console.log('Setting up database change listener for real-time updates');
};

export const startFormPolling = (interval = 10000) => {
  if (pollingInterval) clearInterval(pollingInterval);
  
  console.log(`Starting database polling every ${interval}ms`);
  checkForNewForms();
  pollingInterval = setInterval(checkForNewForms, interval);
  
  return () => {
    if (pollingInterval) clearInterval(pollingInterval);
  };
};

export const stopFormPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('Form polling stopped');
  }
};

// Function to check for new forms and trigger updates
const checkForNewForms = async () => {
  try {
    console.log('Checking for new forms from database...');
    const currentTimestamp = Date.now();
    const response = await axios.get(`${API_URL}/reports?timestamp=${currentTimestamp}`);
    
    let serverForms = [];
    if (response && response.data) {
      console.log('Response from server:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasDataProp: response.data && response.data.data,
      });
      
      if (Array.isArray(response.data)) {
        serverForms = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        serverForms = response.data.data;
      } else if (response.data.success && response.data.data) {
        serverForms = response.data.data;
      } else if (typeof response.data === 'object') {
        const possibleArrayProps = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrayProps.length > 0) {
          serverForms = possibleArrayProps[0];
        }
      }
    }
    
    if (serverForms && serverForms.length > 0) {
      console.log(`Forms found: ${serverForms.length}`);
      window.dispatchEvent(new CustomEvent('formsUpdated', { 
        detail: { 
          source: 'polling', 
          count: serverForms.length,
          timestamp: currentTimestamp
        } 
      }));
    } else {
      console.log('No forms found in server response');
    }
  } catch (error) {
    console.error('Error polling for new forms:', error);
    console.log('Error details:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      API_URL
    });
  }
};

export default api;