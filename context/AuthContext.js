// src/context/AuthContext.js
'use client'; // This directive marks the file as a Client Component

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Provides authentication state and functions (login, logout) to its children.
 * It manages user data and JWT token in localStorage.
 */
export function AuthProvider({ children }) {
  // State to hold the authentication token
  const [token, setToken] = useState(null);
  // State to hold the authenticated user's data
  const [user, setUser] = useState(null);
  // State to track if authentication data has been loaded from localStorage
  const [loading, setLoading] = useState(true);

  const router = useRouter(); // Initialize Next.js router

  // --- Functions to interact with authentication state ---

  // Function to handle user login
  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    // Store token and user data in localStorage for persistence
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    // Clear authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login'); // Redirect to login page after logout
  }, [router]);

  // Effect to load authentication state from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Handle potential parsing errors if localStorage data is corrupt
        console.error("Failed to parse user data from localStorage", e);
        logout(); // Clear invalid data
      }
    }
    setLoading(false); // Mark loading as complete
  }, [logout]); // Dependency on logout to prevent stale closure if logout changes

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    token,
    user,
    isLoggedIn: !!token, // Convenience boolean for login status
    loading,
    login,
    logout,
  }), [token, user, loading, login, logout]);

  // Provide the context value to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to easily consume the AuthContext in any component.
 * @returns {object} The authentication context value (token, user, isLoggedIn, loading, login, logout).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; // Export the context for use in other components