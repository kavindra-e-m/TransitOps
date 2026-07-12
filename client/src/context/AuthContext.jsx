import React, { createContext, useContext, useState } from 'react';
import { loginAPI } from '../api/auth';
import { setClientToken } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password, selectedRole) => {
    const res = await loginAPI(email, password);
    
    // Validate role mapping
    if (selectedRole && res.user.role !== selectedRole) {
      throw new Error(`Access denied. You do not hold the '${selectedRole}' role.`);
    }

    setUser(res.user);
    setRole(res.user.role);
    setToken(res.token);
    setClientToken(res.token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    setClientToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
