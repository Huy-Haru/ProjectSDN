import { useState } from 'react';
import { initialProgress } from '../data/mockData';

export const useProgress = () => {
  const [progress, setProgress] = useState(initialProgress);

  const addWeightRecord = (newWeight, newBodyFat) => {
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const updatedHistory = [
      ...progress.weightHistory,
      {
        date: todayStr,
        weight: parseFloat(newWeight),
        bodyFat: newBodyFat ? parseFloat(newBodyFat) : progress.bodyFat
      }
    ];

    setProgress(prev => ({
      ...prev,
      currentWeight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : prev.bodyFat,
      weightHistory: updatedHistory
    }));
  };

  return {
    progress,
    addWeightRecord
  };
};
