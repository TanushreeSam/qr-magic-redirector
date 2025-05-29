import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/profile';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// UUID validation regex pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (uuid: string): boolean => {
  return UUID_PATTERN.test(uuid);
};

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
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        // Validate both id and qrId are valid UUIDs
        if (isValidUUID(parsedUser.id) && isValidUUID(parsedUser.qrId)) {
          return parsedUser;
        }
        // If validation fails, clear localStorage
        localStorage.removeItem('user');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('AuthContext: Login error:', authError);
        return false;
      }

      if (authData.user) {
        const newUser: User = {
          id: authData.user.id,
          email: authData.user.email!,
          qrId: crypto.randomUUID()
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        console.error('AuthContext: Signup error:', authError);
        return false;
      }

      if (authData.user) {
        const newUser: User = {
          id: authData.user.id,
          email: authData.user.email!,
          qrId: crypto.randomUUID()
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Logout error:', error);
      }
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};