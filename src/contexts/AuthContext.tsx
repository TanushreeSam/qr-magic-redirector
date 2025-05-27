import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/profile';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo authentication - in real app, this would be handled by backend
    if (password.length >= 6) {
      // Check if user already exists
      const existingUserKey = `user_${email}`;
      const existingUser = localStorage.getItem(existingUserKey);
      
      let newUser: User;
      if (existingUser) {
        // Use existing user data
        newUser = JSON.parse(existingUser);
        console.log('AuthContext: Login - Found existing user:', newUser);
      } else {
        // Create new user
        newUser = {
          id: Date.now().toString(),
          email,
          qrId: `qr_${Date.now()}`
        };
        localStorage.setItem(existingUserKey, JSON.stringify(newUser));
        console.log('AuthContext: Login - Created new user:', newUser);
      }
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    // Simple demo signup - in real app, this would be handled by backend
    if (password.length >= 6 && email.includes('@')) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        qrId: `qr_${Date.now()}`
      };
      
      // Store user data permanently
      const userKey = `user_${email}`;
      localStorage.setItem(userKey, JSON.stringify(newUser));
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log('AuthContext: Signup - Created user:', newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Don't remove profile data or QR mappings - keep them for when user logs back in
    console.log('AuthContext: User logged out, profile data preserved');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
