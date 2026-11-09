import { apiRequest } from '../api/apiClient';

export const request = (path, options = {}) =>
  apiRequest(path, {
    method: options.method || 'GET',
    body: options.body,
    signal: options.signal,
    timeoutMs: options.timeoutMs || 8000,
  }).then((response) => response.data);

export const checkConnection = () => request('/health');
