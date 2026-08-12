import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center border-none cursor-pointer transition-all duration-200 ease-in-out font-sans font-medium outline-none';
  
  const variantClasses = {
    primary: 'bg-on-primary text-canvas shadow-[0px_4px_14px_rgba(255,255,255,0.1)] hover:bg-ink-muted hover:shadow-[0px_4px_14px_rgba(255,255,255,0.15)]',
    secondary: 'bg-surface-1 text-ink border border-solid border-hairline hover:bg-surface-2 hover:border-hairline-strong',
    ghost: 'bg-transparent text-ink-subtle hover:bg-surface-1 hover:text-ink'
  };

  const sizeClasses = {
    sm: 'rounded-geist px-3 h-8 text-sm',
    md: 'rounded-pill px-4 h-12 text-base',
    lg: 'rounded-pill px-6 h-14 text-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
