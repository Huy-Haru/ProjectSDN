import { useState } from 'react';
import { initialSchedules } from '../data/mockData';

export const useSchedule = () => {
  const [schedules, setSchedules] = useState(initialSchedules);

  const addSchedule = (newSession) => {
    setSchedules(prev => [newSession, ...prev]);
  };

  const cancelSchedule = (id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const completeSchedule = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Hoàn thành' } : s));
  };

  return {
    schedules,
    addSchedule,
    cancelSchedule,
    completeSchedule
  };
};
