import axios, { AxiosHeaders } from 'axios';

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
    const headers = AxiosHeaders.from(config.headers);
    const auth = headers.get('Authorization');
    if (auth === 'Bearer undefined' || auth === 'Bearer null') {
      headers.delete('Authorization');
    }
    config.headers = headers;

    const token = await tokenGetter();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (__DEV__) {
      console.warn('[API] getToken() returned null — no Authorization header sent');
    }
  } catch (e) {
    if (__DEV__) console.error('[API] Failed to get auth token:', e);
  }

  return config;
});

// Surface all API errors clearly in dev
API.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ✅ ${response.config?.method?.toUpperCase()} ${response.config?.url} → ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const method = error?.config?.method?.toUpperCase();
      const data = error?.response?.data;
      const headers = error?.config?.headers;

      console.log(`[API] ❌ ${method} ${url} → ${status ?? 'NO_RESPONSE'}`);
      console.log('[API] Response body:', JSON.stringify(data, null, 2));
      console.log('[API] Request headers sent:', JSON.stringify({
        Authorization: headers?.Authorization
          ? headers.Authorization.slice(0, 30) + '...'
          : 'MISSING',
      }));

      if (!error?.response) {
        console.error('[API] Network error (no response received):', error?.message);
      }
    }
    return Promise.reject(error);
  }
);

export default API;