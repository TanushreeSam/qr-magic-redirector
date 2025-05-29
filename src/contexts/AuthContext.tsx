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
          qrId: `qr_${Date.now()}`
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
          qrId: `qr_${Date.now()}`
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