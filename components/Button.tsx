
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = "px-6 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-md",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
