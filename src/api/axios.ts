
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.4:5000/api', // Reemplaza con tu IP local real
});

export default API;