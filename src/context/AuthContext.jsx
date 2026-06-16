import { createContext, useState, useContext } from 'react';

// Step 1: Create the context
// Think of this as creating an empty "container" that will hold our auth state
// Any component in the app can reach into this container and get the data
const AuthContext = createContext(null);

// Step 2: Create the Provider
// The Provider is a wrapper component that goes around your whole app
// It holds the actual state and shares it with every child component
export function AuthProvider({ children }) {

  // For now this is hardcoded to false (not logged in)
  // In Milestone 2 we replace this with a real API call
  const [user, setUser] = useState(null);
  // user = null means not logged in
  // user = { id, name, customerType } means logged in

  // This is the login function components will call
  // For now it accepts a fake user object
  // In Milestone 2 this will call the auth service and store the JWT token
  function login(userData) {
    setUser(userData);
    // Later: localStorage.setItem('token', token) goes here
  }

  function logout() {
    setUser(null);
    // Later: localStorage.removeItem('token') goes here
  }

  // isLoggedIn is a derived value — it's true whenever user is not null
  const isLoggedIn = user !== null;

  // Step 3: Pass the state and functions down via value prop
  // Any component that calls useAuth() gets access to all of these
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 4: Create a custom hook so components don't import AuthContext directly
// Instead of: const { isLoggedIn } = useContext(AuthContext)
// Components just do: const { isLoggedIn } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}