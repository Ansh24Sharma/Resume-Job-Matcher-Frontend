import axios from 'axios';
import { API_BASE_URL } from '../apiConstants/constants';
import { getToken } from '../utils/storage';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;