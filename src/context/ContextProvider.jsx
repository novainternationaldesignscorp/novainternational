import { createContext, useContext, useEffect, useState } from "react";

// 1️ Create the Auth Context
const AuthContext = createContext();

// 2️ Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage when app starts
  useEffect(() => {
    // Do not persist user in localStorage for testing/production.
    // Authentication is handled by `UserContext` which fetches session from the server.
  }, []);

  // Login function
  const login = (email) => {
    const userData = { email }; // you can add more info like name, id, token
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  // The value we pass to context consumers
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user, // true if user exists
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3 Hook to use Auth Context in any component
export const useAuth = () => useContext(AuthContext);