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
    return applySession({ token, customerId });
  }

  // Used when a session was obtained some other way (e.g. the legacy
  // credential vault replaying a Google sign-in), so we already have a
  // token/customerId and don't need to call the legacy login endpoint again.
  function loginWithSession({ token, customerId }) {
    return applySession({ token, customerId });
  }

  function applySession(nextAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    return nextAuth;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  const isLoggedIn = auth !== null;

  return (
      <AuthContext.Provider value={{ auth, isLoggedIn, login, loginWithSession, logout }}>
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