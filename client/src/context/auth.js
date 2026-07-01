import { createContext } from 'react';

export const SESSION_KEY = 'asset-manager-session';

export const AuthContext = createContext(null);

export const readSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedSession = window.localStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(storedSession);
    return parsedSession?.token ? parsedSession : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  const session = readSession();
  return session?.token ?? null;
};