import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('https://taskmanagement-akqj.onrender.com/api/users/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Unauthorized');
          }

          const user = await response.json();
          setUser(user);
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { token, user } = data;

      console.log('User registered:', user);

      localStorage.setItem('token', token);

      setUser(user); // assuming setUser is defined in your context or component

      return user;

    } catch (error) {
      console.error('Registration error:', error.message);
      throw error.message || 'Registration failed';
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { token, user } = await response.json();

      localStorage.setItem('token', token);
      // If you're using fetch later, just set the token manually in headers during each request
      // Or optionally store it in state or a helper

      setUser(user);
      return user;
    } catch (error) {
      throw error.message || 'Login failed';
    }
  };

  // Logout function (no need for fetch)
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskmanagement-akqj.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      throw error.message || 'Profile update failed';
    }
  };


  // Context value
const value = {
  user,
  loading,
  login,
  register,
  logout,
  updateProfile
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};