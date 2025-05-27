
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  const toggleMode = () => setIsSignup(!isSignup);

  if (user) {
    return <Dashboard />;
  }

  return (
    <LoginForm onToggleMode={toggleMode} isSignup={isSignup} />
  );
};

export default Index;
