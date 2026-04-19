// import axios, { AxiosInstance } from "axios";
import { useAuthorizationStore } from '../stores/authorization';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import router from '../router';

/** Timeout żądań (ms). Gdy EC2 jest wyłączony, requesty wiszą w pending – po tym czasie dostajemy błąd i przekierowanie na 503. */
const REQUEST_TIMEOUT_MS = 15000;

const apiClient: AxiosInstance = axios.create({
  // baseURL: "https://goahead.focikhome.synology.me/api",
  // baseURL: 'http://localhost:8077/api',
  // baseURL: 'http://pxcm6vnuy9.execute-api.eu-central-1.amazonaws.com/prod/api',
  baseURL: 'https://api.homeoffice.focik.net/api',
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => {
    const path = config.url?.split('?')[0] ?? '';
    if (
      path.endsWith('/login') ||
      path.endsWith('/refresh') ||
      path === '/v1/auth/test' ||
      config.url?.startsWith('https://focik-home.s3.eu-central-1.amazonaws.com/homeoffice/')
    ) {
      console.log('Żądanie do /login, pomijanie nagłówka Authorization');
    } else {
      const authStore = useAuthorizationStore();
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    console.log('ERROR interceptor: ', error);
    const authStore = useAuthorizationStore();

    if (error.response && error.response.status === 401) {
      console.log('Unauthorized - Sprawdzam refresh token...');
      const status = error.response.status;
      const message = error.response.data?.message;

      const requestConfig = error.config as
        | (InternalAxiosRequestConfig & { _retryAfterRefresh?: boolean })
        | undefined;
      if (!requestConfig) {
        return Promise.reject(error);
      }

      // 🛑 Obsługa błędnego logowania (niepoprawne dane logowania)
      if (status === 401 && message === 'INVALID_CREDENTIALS') {
        console.log('Niepoprawne dane logowania!');
        authStore.setLoginError('Niepoprawny login lub hasło.');
        return Promise.reject(error);
      }

      // 🔄 Obsługa wygaśnięcia tokena
      if (error.response.data?.message === 'REFRESH TOKEN EXPIRED') {
        console.log('Refresh token wygasł - wylogowanie...');
        authStore.logout();
        return Promise.reject(error);
      }

      // Jedno ponowienie po refresh – unikamy nieskończonej pętli przy trwałym 401 (np. błąd w interceptorze żądania)
      if (requestConfig._retryAfterRefresh) {
        console.log('401 po ponowieniu żądania – przerywam bez kolejnego odświeżania tokenu.');
        return Promise.reject(error);
      }

      try {
        const response = await authStore.refresh();
        if (response.status === 200) {
          requestConfig._retryAfterRefresh = true;
          return apiClient(requestConfig);
        }
      } catch (err) {
        console.log('Błąd odświeżania tokena', err);
        authStore.logout();
      }
    }

    // Serwer w ogóle nie odpowiedział (brak połączenia / timeout), nie 4xx/5xx – np. EC2 wyłączony
    else if (
      !error.response &&
      (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || error.code === 'ECONNABORTED')
    ) {
      const intendedPath = router.currentRoute.value.fullPath;
      const isErrorPage = intendedPath.startsWith('/error');
      router.push({
        name: 'Error503',
        query: intendedPath && !isErrorPage ? { redirectTo: intendedPath } : undefined,
      });
    }
    // FORBIDDEN
    else if (error.response?.status === 403) {
      console.log('Forbidden (403)', error);
      router.push({
        name: 'Error403',
      });
    }

    return Promise.reject(error);
  }
);
export default apiClient;
