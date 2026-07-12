import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password, selectedRole) => {
    // Swap this block for a real axios call: const res = await api.post('/auth/login', { email, password })
    const fakeToken = `mock-token-${Date.now()}`;
    const fakeUser = { email, name: email.split('@')[0] };
    setUser(fakeUser);
    setRole(selectedRole);
    setToken(fakeToken);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
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
