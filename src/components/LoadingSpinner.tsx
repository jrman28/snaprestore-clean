
import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Restoring Your Photo</h3>
      <p className="text-gray-600 text-center max-w-md">
        Our AI is working its magic. This usually takes 30-60 seconds.
      </p>
    </div>
  );
}
