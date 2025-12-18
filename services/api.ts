import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor for Auth Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    switchRole: () => api.post('/auth/switch-role', {}),
};

export const items = {
    getAll: (params?: any) => api.get('/items', { params }),
    getOne: (id: string) => api.get(`/items/${id}`),
    create: (data: any) => api.post('/items', data),
    update: (id: string, data: any) => api.put(`/items/${id}`, data),
    delete: (id: string) => api.delete(`/items/${id}`),
    getOwnerItems: () => api.get('/items/owner/me'),
};

export const rentals = {
    create: (data: any) => api.post('/rentals', data),
    getMyRentals: () => api.get('/rentals/my-rentals'),
    updateStatus: (id: string, status: string) => api.put(`/rentals/${id}/status`, { status }),
    processPayment: (id: string, token: string) => api.post(`/rentals/${id}/payment`, { token }),
    processBulkPayment: (rentalIds: string[], token: string) => api.post('/rentals/payment-bulk', { rentalIds, token }),
};

export default api;
