import React from 'react';
import { useAuth } from '@/lib/authContext';
import { useLocation } from 'wouter';

const ProfilePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !currentUser) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
              {currentUser.name ? currentUser.name.charAt(0) : currentUser.username.charAt(0)}
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{currentUser.name || 'No name provided'}</h2>
            <p className="text-sm text-gray-500">@{currentUser.username}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            <div className="mt-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between py-2">
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="text-sm text-gray-900">{currentUser.username}</dd>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="text-sm text-gray-900">{currentUser.name || 'Not provided'}</dd>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Password</dt>
                <dd className="text-sm text-gray-900">••••••••</dd>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setLocation('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 