import axios from 'axios';

const API_BASE = 'http://localhost:50001/api'; // Update with your MongoDB server URL

export const submitForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE}/forms`, formData);
    return response.data;
  } catch (error) {
    console.error('MongoDB Submission Error:', error);
    throw error;
  }
};

export const getForms = async () => {
  const response = await axios.get(`${API_BASE}/forms`);
  return response.data;
};
