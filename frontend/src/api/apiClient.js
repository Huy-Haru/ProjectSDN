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

/**
 * Profile API — A2.1
 */
export const profileApi = {
  /** Lấy profile của mình (kèm TrainerProfile nếu là trainer) */
  getMyProfile: () => request('GET', '/profile/me'),

  /** Cập nhật profile cá nhân (whitelist fields) */
  updateMyProfile: (data) => request('PATCH', '/profile/me', data),

  /** Trainer cập nhật TrainerProfile */
  updateTrainerProfile: (data) => request('PATCH', '/profile/trainer', data),

  /** Đổi mật khẩu */
  changePassword: (currentPassword, newPassword) =>
    request('POST', '/profile/change-password', { currentPassword, newPassword })
};

/**
 * Trainer API — A2.2
 */
export const trainerApi = {
  /** PT xem lịch dạy của mình */
  getSchedule: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/trainer/schedule${qs ? '?' + qs : ''}`);
  },

  /** PT xem danh sách hội viên liên quan */
  getMembers: () => request('GET', '/trainer/members'),

  /** Tạo giáo án */
  createWorkoutPlan: (data) => request('POST', '/trainer/workout-plans', data),

  /** Danh sách giáo án của PT (query: memberId, status) */
  getWorkoutPlans: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/trainer/workout-plans${qs ? '?' + qs : ''}`);
  },

  /** Chi tiết một giáo án */
  getWorkoutPlanById: (planId) => request('GET', `/trainer/workout-plans/${planId}`),

  /** Cập nhật giáo án */
  updateWorkoutPlan: (planId, data) => request('PATCH', `/trainer/workout-plans/${planId}`, data),

  /** Member xem giáo án của mình */
  getMemberWorkoutPlans: () => request('GET', '/trainer/member/workout-plans')
};

/**
 * Subscription API — Hiếu (hieunhhe187023)
 */
export const subscriptionApi = {
  /** Member đăng ký gói tập mới */
  subscribe: (packageId, startDate) => request('POST', '/subscriptions', { packageId, startDate }),

  /** Member xem danh sách gói tập của mình */
  getMySubscriptions: () => request('GET', '/subscriptions/my'),

  /** Member xem gói tập đang có hiệu lực hiện tại */
  getActiveSubscription: () => request('GET', '/subscriptions/active'),

  /** Member xem thống kê hạn mức buổi tập của gói hiện tại */
  getMyUsage: () => request('GET', '/subscriptions/usage')
};

/**
 * Booking API — Hiếu (hieunhhe187023)
 */
export const bookingApi = {
  /** Member đặt lịch tập mới với PT */
  createBooking: (data) => request('POST', '/bookings', data),

  /** Member xem danh sách lịch tập của mình */
  getMyBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/bookings/my${qs ? '?' + qs : ''}`);
  },

  /** Member hủy lịch tập */
  cancelBooking: (bookingId, reason) => request('PATCH', `/bookings/${bookingId}/cancel`, { reason })
};


