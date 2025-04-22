import axios from 'axios';

// Configuration - replace these with your actual values
const API_BASE = 'https://us-east-1.aws.data.mongodb-api.com/app/data-abcde/endpoint/data/v1';
const API_KEY = 'venkat'; // Replace with your actual API key
const DATA_SOURCE = 'safeConect';
const DATABASE = 'safeConnect';
const COLLECTION = 'forms';

const handleError = (error) => {
  console.error('MongoDB Atlas Error:', {
    message: error.message,
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  });
  throw error;
};

export const submitForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE}/action/insertOne`, {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: DATA_SOURCE,
      document: formData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getForms = async () => {
  try {
    const response = await axios.post(`${API_BASE}/action/find`, {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: DATA_SOURCE,
      filter: {}
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      }
    });
    return response.data.documents;
  } catch (error) {
    handleError(error);
  }
};

export const getMyForms = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE}/action/find`, {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: DATA_SOURCE,
      filter: { userId }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      }
    });
    return response.data.documents;
  } catch (error) {
    handleError(error);
  }
};

export const updateFormStatus = async (formId, updates) => {
  try {
    const response = await axios.post(`${API_BASE}/action/updateOne`, {
      collection: COLLECTION,
      database: DATABASE,
      dataSource: DATA_SOURCE,
      filter: { _id: { $oid: formId } },
      update: { $set: updates }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
