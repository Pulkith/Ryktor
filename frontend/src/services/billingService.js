import axios from 'axios';

const API_URL = 'http://localhost:8002/api';

export const uploadInsuranceCard = async (frontFile, backFile) => {
  const formData = new FormData();
  formData.append('front', frontFile);
  formData.append('back', backFile);

  const response = await axios.post(`${API_URL}/insurance/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadReceipt = async (receiptFile) => {
  const formData = new FormData();
  formData.append('receipt', receiptFile);

  const response = await axios.post(`${API_URL}/receipt/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 