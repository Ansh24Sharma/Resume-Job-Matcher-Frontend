export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
};

export const setUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('user', JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
};

export const removeToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
};

export const getUserRole = () => {
    const userData = getUserData();
    return userData ? userData.role : null;
};

export const isAuthenticated = () => {
    return !!sessionStorage.getItem('token') && sessionStorage.getItem('user');
};