import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    const fallbackPath = '/'; // Default fallback path
    const backPath = location.state?.from?.pathname || fallbackPath;

    console.log('Going back to:', backPath);
    navigate(backPath, { replace: true });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-5">
      <h1 className="text-9xl font-bold text-blue-600">401</h1>
      <h2 className="text-3xl font-semibold mt-4">Unauthorized Access</h2>
      <p className="text-lg text-gray-600 mt-2">
        You must be logged in to view this page.
      </p>
      <button
        onClick={handleGoBack}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default ProtectedPage;
