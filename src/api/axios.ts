import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nofuiyoapp-backend.onrender.com/api',
});

let tokenGetter: null | (() => Promise<string | null>) = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

// Attach Clerk session token to every request
API.interceptors.request.use(async (config) => {
  if (!tokenGetter) {
    if (__DEV__) console.warn('[API] tokenGetter not set — request will be unauthenticated');
    return config;
  }

  try {
    const token = await tokenGetter();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (__DEV__) {
      console.warn('[API] getToken() returned null — no Authorization header sent');
    }
  } catch (e) {
    if (__DEV__) console.error('[API] Failed to get auth token:', e);
  }

  return config;
});

// Surface auth errors clearly in dev
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__ && error?.response?.status === 401) {
      console.error(
        '[API] 401 Unauthorized —',
        error.config?.url,
        '\n  detail:',
        error.response?.data
      );
    }
    return Promise.reject(error);
  }
);

export default API;