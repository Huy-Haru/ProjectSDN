/**
 * API client cho backend FitManager
 * Base URL đọc từ env hoặc mặc định localhost:5000
 */

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

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
export async function apiRequest(path, { method = 'GET', body, signal, timeoutMs = 15000 } = {}) {
  const token = tokenStorage.get();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
    signal: signal || AbortSignal.timeout(timeoutMs),
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || data?.success === false) {
    const err = new Error(data?.message || 'Không thể xử lý yêu cầu.');
    err.status = res.status;
    throw err;
  }

  return data;
}

const request = (method, path, body, options) => apiRequest(path, { method, body, ...options });

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
  setBookingStatus: (id, status) => request('PATCH', `/trainer/bookings/${id}/status`, { status }),
  /** PT xem lịch dạy của mình */
  getSchedule: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/trainer/schedule${qs ? '?' + qs : ''}`);
  },

  /** PT xem danh sách hội viên liên quan */
  getMembers: (params = {}) => request('GET', '/trainer/members?' + new URLSearchParams(params)),

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
  getMemberWorkoutPlans: () => request('GET', '/trainer/member/workout-plans'),
  getMemberWorkoutSubmissions: (memberId) => request('GET', `/trainer/members/${memberId}/workout-submissions`)
};

export const memberApi = {
  packages: () => request('GET', '/member/packages'),
  subscriptions: () => request('GET', '/member/subscriptions'),
  subscribe: (packageId, startDate) => request('POST', '/member/subscriptions', { packageId, startDate }),
  checkInQr: () => request('GET', '/member/check-in-qr')
};
export const bookingApi = {
  trainers: () => request('GET', '/member/trainers'),
  bookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/member/bookings${qs ? '?' + qs : ''}`);
  },
  create: data => request('POST', '/member/bookings', data),
  cancel: id => request('POST', `/member/bookings/${id}/cancel`),
};
export const progressApi = {
  mine: () => request('GET', '/member/progress'),
  forMember: id => request('GET', `/trainer/members/${id}/progress`),
  create: (id, data) => request('POST', `/trainer/members/${id}/progress`, data),
  // A3.1 generic endpoint used by the merged backend routes.
  getLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/progress${qs ? '?' + qs : ''}`);
  },
  createLog: data => request('POST', '/progress', data)
};
export const workoutApi = {
  submissions: () => request('GET', '/member/workout-submissions'),
  submitProof: data => request('POST', '/member/workout-submissions', data)
};
export const reviewApi = {
  mine: () => request('GET', '/member/reviews'),
  create: data => request('POST', '/member/reviews', data),
  forTrainer: () => request('GET', '/trainer/reviews'),
  // A3.2 generic endpoints from the merged backend routes.
  getMyTrainerReviews: () => request('GET', '/reviews/my-trainer-reviews'),
  getBookingReview: bookingId => request('GET', `/reviews/booking/${bookingId}`),
  getTrainerReviews: trainerId => request('GET', `/reviews/trainer/${trainerId}`)
};
