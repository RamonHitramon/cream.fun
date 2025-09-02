import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className = '',
  type = 'button'
}: ButtonProps) {
  const variantStyles = {
    primary: { 
      backgroundColor: 'var(--color-hl-primary)', 
      color: 'black' 
    },
    success: { 
      backgroundColor: 'var(--color-hl-success)', 
      color: 'black' 
    },
    danger: { 
      backgroundColor: 'var(--color-hl-danger)', 
      color: 'white' 
    }
  };
  
  return (
    <button
      type={type}
      className={`font-medium rounded-xl px-4 py-2 transition-opacity hover:opacity-90 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={variantStyles[variant]}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
