import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className || ''}`} 
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
        />
      ) : children}
    </button>
  );
};
