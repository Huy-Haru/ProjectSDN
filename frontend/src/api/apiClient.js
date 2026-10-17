/**
 * API client cho backend FitManager
 * Base URL đọc từ env hoặc mặc định localhost:5000
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Lưu/xóa token trong localStorage
 */
export const tokenStorage = {
  get: () => localStorage.getItem('fitmanager_token'),
  set: (token) => localStorage.setItem('fitmanager_token', token),
  remove: () => localStorage.removeItem('fitmanager_token')
};

/**
 * Hàm fetch chung, tự gắn Authorization header nếu có token
 */
async function request(method, path, body = null) {
  const token = tokenStorage.get();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Lỗi không xác định');
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  /** Đăng ký tài khoản member mới */
  register: (payload) => request('POST', '/auth/register', payload),

  /** Đăng nhập */
  login: (email, password) => request('POST', '/auth/login', { email, password }),

  /** Đăng xuất */
  logout: () => request('POST', '/auth/logout'),

  /** Lấy thông tin user hiện tại */
  me: () => request('GET', '/auth/me')
};
