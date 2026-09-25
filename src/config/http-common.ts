// import axios, { AxiosInstance } from "axios";
import { useAuthorizationStore } from '../stores/authorization';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import router from '../router';
import { EC2_CONTROL_ENABLED } from '@/config/ec2';

/** Timeout żądań (ms). Gdy EC2 jest wyłączony, requesty wiszą w pending – po tym czasie dostajemy błąd i przekierowanie na 503. */
const REQUEST_TIMEOUT_MS = 45000;

/**
 * Endpointy WebAuthn (/webauthn/**, /login/webauthn) są zaszyte na sztywno w filtrach Spring Security
 * i nie da się ich przeprefiksować pod /api jak reszty API - trzeba je wołać na korzeniu backendu,
 * bez segmentu /api z VITE_API_BASE_URL.
 */
export const WEBAUTHN_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/?$/, '');

const apiClient: AxiosInstance = axios.create({
  // Per-tryb URL w .env.development / .env.production / .env.docker (VITE_API_BASE_URL)
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
      path.endsWith('/auth/google') ||
      path.endsWith('/auth/forgot-password') ||
      path.endsWith('/auth/reset-password') ||
      path.endsWith('/login/webauthn') ||
      path.endsWith('/webauthn/authenticate/options') ||
      path.endsWith('/webauthn/token') ||
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
    const authStore = useAuthorizationStore();
    const errorPath = error.config?.url?.split('?')[0] ?? '';

    // Reset hasła: żądanie zawiera token / hasło - nie logujemy błędu do konsoli i nie uruchamiamy refresh/logout.
    if (errorPath.endsWith('/auth/forgot-password') || errorPath.endsWith('/auth/reset-password')) {
      return Promise.reject(error);
    }
    console.log('ERROR interceptor: ', error);

    // Logowanie Google/passkey: błędy obsługiwane bezpośrednio w authorizationStore.loginWithGoogle() /
    // loginWithPasskey() - pomijamy tu refresh/logout, żeby nie dublować efektów ubocznych.
    if (
      errorPath.endsWith('/auth/google') ||
      errorPath.endsWith('/login/webauthn') ||
      errorPath.endsWith('/webauthn/authenticate/options') ||
      errorPath.endsWith('/webauthn/token')
    ) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      console.log('Unauthorized - Sprawdzam refresh token...');
      const status = error.response.status;
      const message = error.response.data?.message;

      const requestConfig = error.config as (InternalAxiosRequestConfig & { _retryAfterRefresh?: boolean }) | undefined;
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
      EC2_CONTROL_ENABLED &&
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
