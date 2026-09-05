import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Avatar = ({
  src,
  alt = 'User avatar',
  name = '',
  size = 'md',
  isVerified = false,
  status,
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold'
  };

  const badgeSizes = {
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-1 -right-1',
    lg: 'w-5 h-5 bottom-0 right-0',
    xl: 'w-6 h-6 bottom-0.5 right-0.5'
  };

  const getInitials = (str) => {
    if (!str) return 'CS';
    return str
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size] || sizes.md} rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-emerald-300`}
        >
          {getInitials(name)}
        </div>
      )}

      {isVerified && (
        <div
          className={`absolute ${badgeSizes[size] || badgeSizes.md} bg-emerald-600 text-white rounded-full flex items-center justify-center shadow ring-2 ring-white`}
          title="Verified CoopServe Provider"
        >
          <ShieldCheck className="w-full h-full p-0.5" />
        </div>
      )}

      {status && (
        <span
          className={`absolute ${badgeSizes[size]} rounded-full ring-2 ring-white ${
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};
