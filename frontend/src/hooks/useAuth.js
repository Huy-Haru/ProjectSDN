import { useState } from 'react';
import { currentUser, demoAccounts } from '../data/mockData';

export const useAuth = () => {
  const [user, setUser] = useState(currentUser);

  const login = (account) => {
    setUser(account);
  };

  const logout = () => {
    setUser(demoAccounts.user);
  };

  const switchRole = (roleKey) => {
    if (demoAccounts[roleKey]) {
      setUser(demoAccounts[roleKey]);
    }
  };

  return {
    user,
    login,
    logout,
    switchRole,
    role: user?.role || 'USER'
  };
};
