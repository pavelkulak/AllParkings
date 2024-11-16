import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

let accessToken: string = ''

export function setAccessToken(newToken: string): void {
  accessToken = newToken;
} 

axiosInstance.interceptors.request.use((config) => {
  config.withCredentials = true;

  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
})

export default axiosInstance