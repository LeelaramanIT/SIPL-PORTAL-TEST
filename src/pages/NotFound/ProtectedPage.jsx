import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    const fallbackPath = '/'; // Default fallback path
    const backPath = location.state?.from?.pathname || fallbackPath;
    navigate(backPath, { replace: true });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-center p-5">
      <div className='bg-[var(--color-background)] p-8 rounded-lg border border-[var(--color-secondary)] max-w-md'>
        <h1 className="text-9xl font-bold text-[var(--color-primary)]">401</h1>
        <h2 className="text-3xl font-semibold mt-4 text-[var(--color-primary)]">Unauthorized Access</h2>
        <p className="text-lg text-[var(--color-text)] opacity-75 mt-2">
          You must be logged in to view this page.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-6 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-hover)] rounded-lg shadow-md transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ProtectedPage;
