import axios from "axios";

const API_URL = "http://localhost:8002/api";

export const optimizeRepayment = async (repaymentPlan) => {
  const response = await axios.post(`${API_URL}/repayment/optimize`, repaymentPlan);
  console.log("repaymentPlan");
  console.log(repaymentPlan);
  console.log(response.data);
  return response.data.strategies;
}; 