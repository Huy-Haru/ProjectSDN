const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, { ...options, signal: options.signal || AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', ...options.headers } });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || 'API request failed');
  return result.data;
}
export const checkConnection = () => request('/health');
