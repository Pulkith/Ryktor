import axios from 'axios';

const API_URL = 'http://localhost:8002/api';

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await axios.post(`${API_URL}/transcribe`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log(response.data);
  return response.data.text;
}; 