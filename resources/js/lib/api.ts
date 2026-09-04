import axios from 'axios';

const api = axios.create({
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        if (status === 419) {
            window.location.reload();
        } else if (status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
