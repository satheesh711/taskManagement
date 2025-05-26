import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register function
  const register = async (userData) => {
    // Register a new user
    return "success";
  };

  // Context value
  const value = {
    user,
    loading,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};