import axios from 'axios';

const API_BASE_URL = 'http://localhost:3080/api';

export const api = {
  // Accounts Service
  getContacts: async () => {
    const response = await axios.get(`${API_BASE_URL}/accounts/contacts`);
    return response.data;
  },

  // Exchange Rate Service
  getRates: async () => {
    const response = await axios.get(`${API_BASE_URL}/rates`);
    return response.data;
  },

  getBics: async () => {
    const response = await axios.get(`${API_BASE_URL}/rates/bics`);
    return response.data;
  },

  // Payment Service
  getSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/p2p-payment/summary`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await axios.get(`${API_BASE_URL}/p2p-payment/history`);
    return response.data;
  },
  
  processPayment: async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/p2p-payment`, data);
    return response.data;
  }
};
