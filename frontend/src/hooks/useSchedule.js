import { useState, useEffect, useCallback } from 'react';
import { initialSchedules } from '../data/mockData';
import { bookingApi, subscriptionApi, tokenStorage } from '../api/apiClient';

/**
 * Chuyển đổi dữ liệu Booking từ MongoDB Backend sang định dạng giao diện UI
 */
function mapBookingToSchedule(b) {
  const statusMap = {
    booked: 'Sắp diễn ra',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    no_show: 'Vắng mặt'
  };

  const trainerUser = b.trainer?.user || {};
  const dateStr = b.date ? new Date(b.date).toISOString().split('T')[0] : '';

  return {
    id: b._id,
    _id: b._id,
    trainerId: b.trainer?._id || b.trainer,
    trainerName: trainerUser.fullName ? `HLV. ${trainerUser.fullName}` : (b.trainerName || 'HLV FitManager'),
    trainerAvatar: trainerUser.avatar || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    date: dateStr,
    time: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : (b.time || ''),
    startTime: b.startTime,
    endTime: b.endTime,
    workoutType: b.note?.split('|')[0]?.trim() || 'Buổi tập cùng PT 1:1',
    location: 'Khu tập Gym & PT chuyên sâu',
    status: statusMap[b.status] || b.status,
    rawStatus: b.status,
    note: b.note || ''
  };
}

export const useSchedule = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách lịch tập thật từ backend
  const refreshSchedules = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Gọi đồng thời lấy danh sách lịch và hạn mức gói
      const [bookingsRes, usageRes] = await Promise.allSettled([
        bookingApi.getMyBookings(),
        subscriptionApi.getMyUsage()
      ]);

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data) {
        const serverSchedules = bookingsRes.value.data.map(mapBookingToSchedule);
        setSchedules(serverSchedules);
      }

      if (usageRes.status === 'fulfilled' && usageRes.value?.data) {
        setUsage(usageRes.value.data);
      }
    } catch (err) {
      console.warn('Lỗi khi tải lịch tập từ API thật, giữ mock data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  // Thêm lịch tập mới (Nối API thật nếu đã đăng nhập)
  const addSchedule = async (newSession) => {
    const token = tokenStorage.get();
    if (token && newSession.trainerId && newSession.date) {
      try {
        let startTime = newSession.startTime;
        let endTime = newSession.endTime;

        if ((!startTime || !endTime) && newSession.time) {
          const parts = newSession.time.split('-').map(s => s.trim());
          startTime = parts[0] || '09:00';
          endTime = parts[1] || '10:00';
        }

        const res = await bookingApi.createBooking({
          trainerId: newSession.trainerId,
          date: newSession.date,
          startTime: startTime || '09:00',
          endTime: endTime || '10:00',
          note: newSession.workoutType ? `${newSession.workoutType} - ${newSession.note || ''}` : newSession.note
        });

        if (res.data?.booking) {
          const mapped = mapBookingToSchedule(res.data.booking);
          setSchedules(prev => [mapped, ...prev]);
          if (res.data.remainingSessions !== undefined) {
            setUsage(prev => prev ? { ...prev, remainingSessions: res.data.remainingSessions } : null);
          }
          return mapped;
        }
      } catch (err) {
        console.error('Không thể tạo booking qua API:', err);
        throw err;
      }
    }

    // Fallback local nếu chưa đăng nhập
    setSchedules(prev => [newSession, ...prev]);
    return newSession;
  };

  // Hủy lịch tập
  const cancelSchedule = async (id, reason = 'Học viên hủy lịch') => {
    const token = tokenStorage.get();
    if (token && id && !id.toString().startsWith('sch_')) {
      try {
        const res = await bookingApi.cancelBooking(id, reason);
        if (res.data?.booking) {
          setSchedules(prev =>
            prev.map(s => (s.id === id || s._id === id) ? { ...s, status: 'Đã hủy', rawStatus: 'cancelled' } : s)
          );
          if (res.data.remainingSessions !== undefined) {
            setUsage(prev => prev ? { ...prev, remainingSessions: res.data.remainingSessions } : null);
          }
          return;
        }
      } catch (err) {
        console.error('Lỗi khi hủy lịch qua API:', err);
        throw err;
      }
    }

    // Fallback UI nếu là mock item
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Hoàn thành lịch tập
  const completeSchedule = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Hoàn thành' } : s));
  };

  return {
    schedules,
    usage,
    loading,
    error,
    addSchedule,
    cancelSchedule,
    completeSchedule,
    refreshSchedules
  };
};
