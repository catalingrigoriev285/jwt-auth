const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const ENDPOINTS = {
    USER_REGISTER: `${API_ENDPOINT}/users/register`,
    USER_LOGIN: `${API_ENDPOINT}/users/login`,
    USER_LOGOUT: `${API_ENDPOINT}/users/logout`,
    USER_ME: `${API_ENDPOINT}/users/me`,
    USER_REFRESH: `${API_ENDPOINT}/users/refresh`,
};

export default ENDPOINTS;