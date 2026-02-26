
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nofuiyoapp-backend.onrender.com/api',
});

// 1) Aquí guardamos una función que nos devuelve el token de Clerk
let tokenGetter: null | (() => Promise<string | null>) = null;

// 2) Esta función se llama una vez desde React (donde sí hay hooks)
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

// 3) Interceptor: antes de cada request, agrega Authorization: Bearer <token>
API.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;