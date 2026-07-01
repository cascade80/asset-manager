import { useEffect, useState } from 'react';
import { AuthContext, SESSION_KEY, readSession } from './auth.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = (nextUser) => {
    setUser({
      token: nextUser.token,
      user: nextUser.user,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user?.user ?? null,
        token: user?.token ?? null,
        login,
        logout,
        isAuthenticated: Boolean(user?.token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};