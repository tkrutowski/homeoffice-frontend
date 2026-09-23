import { defineStore } from 'pinia';
import httpCommon, { WEBAUTHN_BASE_URL } from '@/config/http-common';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import type { AxiosError } from 'axios';
import type { CustomJwtPayload } from '@/types/User.ts';
import router from '../router';
import { queryClient } from '@/config/queryClient';
import { useWebAuthn } from '@/composables/useWebAuthn';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export const useAuthorizationStore = defineStore('authorization', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loginError: null as string | null,
    isAuthenticated: false,
    loading: false,
    username: localStorage.getItem('username') || '',
    userPrivileges: [] as string[],
  }),

  //getters = computed
  getters: {
    hasAccessAdmin(): boolean {
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          return decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinance() ERROR', error);
        return false;
      }
    },
    isAuthenticatedOrToken(): boolean {
      try {
        if (this.accessToken) {
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          return this.isAuthenticated || moment.unix(decoded.exp).isAfter(moment());
        }
        return this.isAuthenticated;
      } catch (error) {
        console.log('isAuthenticatedOrToken() ERROR', error);
        return false;
      }
    },
    hasAccessGoAhead(): boolean {
      console.log('hasAccessGoAhead()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_GOAHEAD') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessGoAhead() ERROR', error);
        return false;
      }
    },
    hasAccessFinancePaymentReadAll(): boolean {
      console.log('hasAccessFinancePaymentReadAll()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('FINANCE_PAYMENT_READ_ALL') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinancePurchaseWriteAll() ERROR', error);
        return false;
      }
    },
    hasAccessFinance(): boolean {
      console.log('hasAccessFinance()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinance() ERROR', error);
        return false;
      }
    },
    hasAccessFinancePurchaseReadAll(): boolean {
      console.log('hasAccessFinancePurchaseReadAll()');
      try {
        if (this.accessToken) {
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          return (
            decoded.authorities.includes('FINANCE_PURCHASE_READ_ALL') || decoded.authorities.includes('ROLE_ADMIN')
          );
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinancePurchaseReadAll() ERROR', error);
        return false;
      }
    },
    hasAccessFinancePurchase(): boolean {
      console.log('hasAccessFinancePurchase()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_PURCHASE') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinancePurchase() ERROR', error);
        return false;
      }
    },
    hasAccessFinancePurchaseWriteAll(): boolean {
      console.log('hasAccessFinancePurchaseWriteAll()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return (
            decoded.authorities.includes('FINANCE_PURCHASE_WRITE_ALL') || decoded.authorities.includes('ROLE_ADMIN')
          );
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinancePurchaseWriteAll() ERROR', error);
        return false;
      }
    },
    hasAccessFinancePayment(): boolean {
      console.log('hasAccessFinancePayment()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_PAYMENT') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinancePayment() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceLoanReadAll(): boolean {
      console.log('hasAccessFinanceLoanReadAll()');
      try {
        if (this.accessToken) {
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          return decoded.authorities.includes('FINANCE_LOAN_READ_ALL') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceLoanReadAll() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceLoan(): boolean {
      console.log('hasAccessFinanceLoan()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_LOAN') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceLoan() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceFeeReadAll(): boolean {
      console.log('hasAccessFinanceFeeReadAll()');
      try {
        if (this.accessToken) {
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          return decoded.authorities.includes('FINANCE_FEE_READ_ALL') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceFeeReadAll() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceFee(): boolean {
      console.log('hasAccessFinanceFee()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_FEE') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceFee() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceFirm(): boolean {
      console.log('hasAccessFinanceFirm()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_FIRM') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceFirm() ERROR', error);
        return false;
      }
    },
    hasAccessFinanceBank(): boolean {
      console.log('hasAccessFinanceBank()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_FINANCE_BANK') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessFinanceBank() ERROR', error);
        return false;
      }
    },
    hasAccessLibrary(): boolean {
      console.log('hasAccessLibrary()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_LIBRARY') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessLibrary() ERROR', error);
        return false;
      }
    },
    hasAccessDevice(): boolean {
      console.log('hasAccessDevices()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_DEVICE') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessDevices() ERROR', error);
        return false;
      }
    },
    hasAccessComputer(): boolean {
      console.log('hasAccessComputer()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('ROLE_COMPUTER') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessComputer() ERROR', error);
        return false;
      }
    },
    hasAccessComputerWriteAll(): boolean {
      console.log('hasAccessComputerWriteAll()');
      try {
        if (this.accessToken) {
          // console.log("token : ", this.token);
          const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
          // console.log("token decoded: ", decoded);
          return decoded.authorities.includes('COMPUTER_WRITE_ALL') || decoded.authorities.includes('ROLE_ADMIN');
        } else {
          return false;
        }
      } catch (error) {
        console.log('hasAccessComputerWriteAll() ERROR', error);
        return false;
      }
    },
  },

  //actions = metody w komponentach
  actions: {
    setLoginError(message: string) {
      this.loginError = message;
    },
    clearLoginError() {
      this.loginError = null;
    },
    logUser(token: string, refreshToken: string, clearQueryCache = false) {
      console.log('logUser: accessToken: ', token, ', refresh token: ', refreshToken);
      if (clearQueryCache) {
        queryClient.clear();
      }
      this.accessToken = token;
      localStorage.setItem('accessToken', token);
      this.isAuthenticated = true;
      const decoded = jwtDecode<CustomJwtPayload>(this.accessToken);
      if (decoded.sub) {
        this.username = decoded.sub;
        localStorage.setItem('username', decoded.sub);
      }
      this.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
      this.clearLoginError();
    },
    //
    //LOGIN
    //
    async login(username: string, password: string) {
      console.log('START - login()');
      this.loading = true;
      const res = await httpCommon.post('/v1/auth/login', {
        username: username,
        password: password,
      });

      console.log('login res: ', res);
      this.logUser(res.data.accessToken, res.data.refreshToken, true);

      this.loading = false;
      this.clearLoginError();
      console.log('END - login()');
      return true;
    },
    //
    //LOGIN PRZEZ GOOGLE
    //
    async loginWithGoogle(idToken: string) {
      console.log('START - loginWithGoogle()');
      this.loading = true;
      try {
        const res = await httpCommon.post('/v1/auth/google', { idToken });
        this.logUser(res.data.accessToken, res.data.refreshToken, true);
        this.clearLoginError();
        console.log('END - loginWithGoogle()');
        return true;
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string; details?: string }>;
        if (axiosError.response?.status === 400) {
          this.setLoginError(
            'To konto Google nie jest powiązane z żadnym kontem w aplikacji. Skontaktuj się z administratorem.'
          );
        } else {
          this.setLoginError('Nie udało się zalogować przez Google.');
        }
        return false;
      } finally {
        this.loading = false;
      }
    },
    //
    //LOGIN PRZEZ PASSKEY (odcisk palca / Face ID / Windows Hello)
    //
    async loginWithPasskey() {
      console.log('START - loginWithPasskey()');
      this.loading = true;
      try {
        const optionsRes = await httpCommon.post<PublicKeyCredentialRequestOptionsJSON>(
          '/webauthn/authenticate/options',
          undefined,
          { baseURL: WEBAUTHN_BASE_URL, withCredentials: true }
        );

        const { performAuthentication } = useWebAuthn();
        const credential = await performAuthentication(optionsRes.data);
        if (!credential) {
          // Użytkownik anulował prompt biometrii - ciche anulowanie, nie błąd
          console.log('loginWithPasskey() - anulowano przez użytkownika');
          return false;
        }

        await httpCommon.post('/login/webauthn', credential, { baseURL: WEBAUTHN_BASE_URL, withCredentials: true });
        const tokenRes = await httpCommon.post('/webauthn/token', undefined, {
          baseURL: WEBAUTHN_BASE_URL,
          withCredentials: true,
        });
        this.logUser(tokenRes.data.accessToken, tokenRes.data.refreshToken, true);
        this.clearLoginError();
        console.log('END - loginWithPasskey()');
        return true;
      } catch {
        this.setLoginError('Logowanie kluczem dostępu nie powiodło się. Użyj hasła lub Google.');
        return false;
      } finally {
        this.loading = false;
      }
    },
    //
    //LOGOUT
    //
    logout(): void {
      console.log('START - logout()');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      this.clearLoginError();
      this.$reset(); //store reset
      queryClient.clear();
      router.replace({ name: 'login' });
    },
    //
    //REFRESH
    //
    async refresh() {
      console.log('START - refresh()');
      const refreshToken = localStorage.getItem('refreshToken') || null;
      console.log('refreshToken', refreshToken);
      const response = await httpCommon.post('/v1/auth/refresh', {
        refreshToken: refreshToken,
      });
      if (response.status === 200) {
        console.log('refresh() - success - update tokens...', response);
        this.logUser(response.data.accessToken, response.data.refreshToken);
      }
      console.log('END - refresh()');
      return response;
    },

    //
    // TEST PING
    //
    async testPing() {
      console.log('START - testPing()');
      return await httpCommon.get('/v1/auth/test');
    },
  },
});
