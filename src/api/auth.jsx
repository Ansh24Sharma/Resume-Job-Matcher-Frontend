import api from './api';
import { LOGIN_URL, SIGNUP_URL } from '../constants/apiConstants';
import { setToken, setUserData } from '../utils/storage';

export const signup = (username, email, password, role = "user") => {
    return api.post(SIGNUP_URL, {
        username,
        email,
        password,
        role
    });
};

export const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post(LOGIN_URL, formData);
    setToken(response.data.token);
    setUserData(response.data.email);
       return response;
};