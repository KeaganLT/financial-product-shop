import { createContext, useState, useContext } from 'react';
import { login as loginRequest } from '../services/authService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'auth';

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);
  // auth = null means not logged in
  // auth = { token, customerId } means logged in

  async function login(username, password) {
    const { token, customerId } = await loginRequest(username, password);
    const nextAuth = { token, customerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  const isLoggedIn = auth !== null;

  return (
      <AuthContext.Provider value={{ auth, isLoggedIn, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}