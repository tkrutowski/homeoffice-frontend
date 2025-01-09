// import axios, { AxiosInstance } from "axios";
import { useAuthorizationStore } from '../stores/authorization'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import router from "../router";

const apiClient: AxiosInstance = axios.create({
  baseURL: "https://goahead.focikhome.synology.me/api",
  // baseURL: 'http://localhost:8077/api',
  headers: {
    'Content-type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    if (
      config.url?.endsWith('/login') ||
      config.url?.endsWith('/refresh') ||
      config.url?.endsWith('/test')
    ) {
      console.log('Żądanie do /login, pomijanie nagłówka Authorization')
    } else {
      const authStore = useAuthorizationStore()
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

let refreshing = false

apiClient.interceptors.response.use(
  (response) => {
    // console.log("response: ", response);
    return response
  },
  async (error) => {
    console.log('ERROR interceptor: ', error)
    const refreshToken: string | null = localStorage.getItem('refreshToken') || null
    const authStore = useAuthorizationStore()
    if (!refreshing && error.response && error.response.status === 401 && refreshToken) {
      console.log('ERROR refreshing token...')
      refreshing = true
      const response = await authStore.refresh()
      if (response.status === 200 && response.data.accessToken) {
        refreshing = false
        return apiClient(error.config)
      }
      //TOKEN EXPIRED
    } else if (error.response?.status === 401 && error.response?.data?.message === 'REFRESH TOKEN EXPIRED') {
      authStore.logout()
    }
    // SERVER OFFLINE
    else if (error.code == 'ERR_NETWORK' || error.code == 'ERR_CONNECTION_REFUSED') {
      console.log('NETWORK ERROR')
      router.push({
        name: 'Error503',
      })
    }
    //FORBIDDEN
    else if (error.code == 'ERR_BAD_REQUEST' && error.message.toString().includes('403')) {
      console.log('ERR_BAD_REQUEST', error)
      router.push({
        name: 'Error403',
      })
    }
    refreshing = false
    throw error
  },
)

export default apiClient
