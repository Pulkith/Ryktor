import axios from "axios";

const API_URL = "http://localhost:8002/api";

export const uploadInsuranceCard = async (frontFile, backFile, userId) => {
  const formData = new FormData();
  formData.append("front_image", frontFile);
  formData.append("back_image", backFile);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/insurance/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadReceipt = async (receiptFile, illnessId, userId) => {
  const formData = new FormData();
  formData.append("receipt", receiptFile);
  formData.append("illness_id", illnessId);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/receipt/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadRecord = async (recordFile, userId) => {
  const formData = new FormData();
  formData.append("record", recordFile);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/record/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUserIllnesses = async (userId) => {
  console.log(userId);
  const response = await axios.get(`${API_URL}/illness/user/${userId}`);
  console.log(response.data);
  if (response.data && response.data.length > 0) {
    const illnesses = response.data.map((illness) => illness.symptoms);
    console.log(illnesses);
    return illnesses;
  }
  return [];
};

export const getAllBillingReceptions = async (userId) => {
  const response = await axios.get(`${API_URL}/receipt/user/${userId}`);

  return response.data;
};

export const getAllBillingRecords = async (userId) => {
  const response = await axios.get(`${API_URL}/record/user/${userId}`);

  return response.data;
};

export const getBillById = async (billId) => {
  const response = await axios.get(`${API_URL}/receipt/bill/${billId}`);
  return response.data;
};

export const deleteBill = async (billId) => {
  const response = await axios.delete(`${API_URL}/receipt/${billId}`);
  return response.data;
};

export const getInsuranceCard = async (userId) => {
  const response = await axios.get(`${API_URL}/insurance/${userId}`);
  return response.data;
};
