import React from "react";

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2 border-t-[#1f3441]',
    md: 'w-12 h-12 border-4 border-t-[#1f3441]',
    lg: 'w-16 h-16 border-4 border-t-[#1f3441]'
  };

  return (
    <div className="glass-card mx-auto max-w-md space-y-4 text-center auth-enter">
      <div className="flex justify-center">
        <div className={`${sizes[size]} animate-spin rounded-full border-[#d4d4d4]`}>
        </div>
      </div>
      {message && (
        <div>
          <p className="text-sm font-semibold text-[#111827]">{message}</p>
          <p className="mt-1.5 text-xs text-[#8a8a8a]">This may take a moment...</p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;