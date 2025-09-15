import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard.jsx';
import Login from './components/Login.jsx';
import AuthCallback from './components/AuthCallback.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('emailAppUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('emailAppUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('emailAppUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('emailAppUser');
  };

  // Check if this is the auth callback route
  const isAuthCallback = window.location.pathname === '/auth/callback';

  // Show auth callback component
  if (isAuthCallback) {
    return <AuthCallback onLogin={handleLogin} />;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show dashboard if user is authenticated
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
