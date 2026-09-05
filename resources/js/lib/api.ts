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

    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;

    return config;
});

api.interceptors.response.use(
    (response) => {
        const body = response.data;

        if (
            body !== null &&
            typeof body === 'object' &&
            !Array.isArray(body) &&
            'data' in body &&
            Array.isArray(body.data) &&
            !('meta' in body) &&
            !('links' in body) &&
            Object.keys(body).length === 1
        ) {
            response.data = body.data;
        }

        return response;
    },
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
