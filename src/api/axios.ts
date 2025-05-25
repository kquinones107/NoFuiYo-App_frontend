
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nofuiyoapp-backend.onrender.com/api', // Reemplaza con tu IP local real
});

export default API;