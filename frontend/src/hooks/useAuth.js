import { useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage } from '../api/apiClient';

/**
 * Hook quản lý phiên đăng nhập thật từ server.
 * - Lưu token vào localStorage
 * - Phục hồi phiên khi tải lại trang (gọi /auth/me)
 * - Role lấy từ server, không cho client tự đổi
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Đang phục hồi phiên

  // Phục hồi phiên khi tải lại trang
  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data.user);
      } catch {
        // Token hết hạn hoặc không hợp lệ → xóa
        tokenStorage.remove();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * Đăng nhập thật qua API
   * @returns {{ user, token }} hoặc throw Error
   */
  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const { token, user: serverUser } = res.data;
    tokenStorage.set(token);
    setUser(serverUser);
    return serverUser;
  }, []);

  /**
   * Đăng xuất — xóa token, reset user
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — vẫn xóa token dù server lỗi
    } finally {
      tokenStorage.remove();
      setUser(null);
    }
  }, []);

  /**
   * Đăng ký tài khoản member mới
   * @returns {Object} user mới
   */
  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    const { token, user: serverUser } = res.data;
    tokenStorage.set(token);
    setUser(serverUser);
    return serverUser;
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    register,
    isLoggedIn: !!user,
    role: user?.role || null
  };
};
