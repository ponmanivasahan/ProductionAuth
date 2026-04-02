import React from "react";
const LoadingSpinner=({size='md',message='Loading...'})=>{
  const sizes={
    sm:'w-6 h-6',
    md:'w-12 h-12',
    lg:'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
        <div className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}>
        </div>
        {message &&<p className="mt-3 text-gray-600">{message}</p>}
    </div>
  )
}

export default LoadingSpinner;