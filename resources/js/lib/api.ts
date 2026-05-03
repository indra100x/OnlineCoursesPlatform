import axios from 'axios';

const csrfToken =
    typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        : null;

const api = axios.create({
    headers: {
        Accept: 'application/json',
        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

export default api;
