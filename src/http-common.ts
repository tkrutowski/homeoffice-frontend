import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "https://goahead.focikhome.synology.me/api/v1",
  // baseURL: "http://localhost:8088/api/v1",
  headers: {
    "Content-type": "application/json",
  },
});

export default apiClient;
