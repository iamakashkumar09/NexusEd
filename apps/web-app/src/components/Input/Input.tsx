import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className, ...props }, ref) => {
    const containerClasses = [
      'flex flex-col gap-2 mb-4',
      fullWidth ? 'w-full' : '',
      className || ''
    ].filter(Boolean).join(' ');

    const inputClasses = [
      'w-full box-border bg-surface-1 text-ink border border-solid rounded-geist px-3 h-11 font-sans text-base outline-none transition-all duration-200 ease-in-out',
      error 
        ? 'border-error focus:shadow-[0_0_0_2px_rgba(238,0,0,0.2)]' 
        : 'border-hairline focus:border-hairline-strong focus:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]'
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && <label className="font-sans text-sm font-medium text-ink">{label}</label>}
        <input 
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && <span className="font-sans text-[13px] text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
