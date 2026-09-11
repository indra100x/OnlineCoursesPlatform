import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration', true);
const dashboardDuration = new Trend('dashboard_duration', true);

const BASE_URL = __ENV.BASE_URL || 'https://localhost';

export const options = {
    stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '10s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],
        errors: ['rate<0.15'],
    },
    insecureSkipTLSVerify: true,
};

export default function () {
    const jar = http.cookieJar();

    // 1. Visit login page
    const loginPage = http.get(`${BASE_URL}/login`, { tags: { name: 'GET /login' } });
    check(loginPage, {
        'login page 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    const csrfMatch = loginPage.body.match(/csrf-token"\s+content="([^"]+)"/);
    if (!csrfMatch) {
        errorRate.add(1);
        return;
    }
    const csrfToken = csrfMatch[1];

    sleep(1);

    // 2. Login
    const loginRes = http.post(
        `${BASE_URL}/login`,
        `_token=${csrfToken}&email=admin@courses.test&password=AdminPass123!`,
        { redirects: 0, tags: { name: 'POST /login' } }
    );
    loginDuration.add(loginRes.timings.duration);
    check(loginRes, {
        'login 302 redirect': (r) => r.status === 302,
    }) || errorRate.add(1);

    sleep(1);

    // 3. Dashboard (follows redirect)
    const dashRes = http.get(`${BASE_URL}/dashboard`, { tags: { name: 'GET /dashboard' } });
    dashboardDuration.add(dashRes.timings.duration);
    check(dashRes, {
        'dashboard 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // 4. Users API
    const usersRes = http.get(`${BASE_URL}/users`, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        tags: { name: 'GET /users' },
    });
    check(usersRes, {
        'users API 200': (r) => r.status === 200,
        'users is array': (r) => {
            try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
        },
    }) || errorRate.add(1);

    sleep(2);

    // 5. Catalog
    const catalogRes = http.get(`${BASE_URL}/catalog`, { tags: { name: 'GET /catalog' } });
    check(catalogRes, {
        'catalog 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(2);
}

export function handleSummary(data) {
    return {
        '/tmp/k6-results.json': JSON.stringify(data, null, 2),
        stdout: buildSummary(data),
    };
}

function buildSummary(data) {
    let out = '\n';
    out += '========== k6 Load Test Results ==========\n\n';

    const dur = data.metrics?.http_req_duration?.values;
    if (dur) {
        out += '  HTTP Request Duration:\n';
        out += `    avg:  ${dur.avg?.toFixed(2)}ms\n`;
        out += `    med:  ${dur.med?.toFixed(2)}ms\n`;
        out += `    p90:  ${dur['p(90)']?.toFixed(2)}ms\n`;
        out += `    p95:  ${dur['p(95)']?.toFixed(2)}ms\n`;
        out += `    max:  ${dur.max?.toFixed(2)}ms\n`;
    }

    const reqs = data.metrics?.http_reqs?.values;
    if (reqs) {
        out += '\n  Throughput:\n';
        out += `    Total Requests: ${reqs.count}\n`;
        out += `    Requests/sec:   ${reqs.rate?.toFixed(0)}\n`;
    }

    const failed = data.metrics?.http_req_failed?.values;
    if (failed) {
        out += `\n  Failed Requests: ${(failed.rate * 100)?.toFixed(2)}%\n`;
    }

    const loginD = data.metrics?.login_duration?.values;
    if (loginD) {
        out += '\n  Login Duration:\n';
        out += `    avg:  ${loginD.avg?.toFixed(2)}ms\n`;
        out += `    p95:  ${loginD.values?.['p(95)']?.toFixed(2) || loginD['p(95)']?.toFixed(2)}ms\n`;
    }

    const dashD = data.metrics?.dashboard_duration?.values;
    if (dashD) {
        out += '\n  Dashboard Duration:\n';
        out += `    avg:  ${dashD.avg?.toFixed(2)}ms\n`;
        out += `    p95:  ${dashD.values?.['p(95)']?.toFixed(2) || dashD['p(95)']?.toFixed(2)}ms\n`;
    }

    const iterations = data.metrics?.iterations?.values;
    if (iterations) {
        out += `\n  Completed Iterations: ${iterations.count}\n`;
    }

    out += '\n===========================================\n';
    return out;
}
