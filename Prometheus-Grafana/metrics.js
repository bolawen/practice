import { register,Summary, Counter,  collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ register });

export const curlResponseTime = new Summary({
    name: 'curl_http_response_time_ms',
    help: 'ms to curl a request',
    labelNames: ['method', 'path', 'httpStatus', 'code'],
});

export const curlRequestTotal = new Counter({
    name: 'curl_http_request_total',
    help: 'number of curl requests to a route',
    labelNames: ['method', 'path', 'httpStatus', 'code'],
});

export const responseTime = new Summary({
    name: 'http_response_time_ms',
    help: 'ms to handle a request',
    labelNames: ['method', 'path', 'httpStatus', 'code'],
});

export const requestTotal = new Counter({
    name: 'http_request_total',
    help: 'number of requests to a route',
    labelNames: ['method', 'path', 'httpStatus', 'code'],
});

export { register };