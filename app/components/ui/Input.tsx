import React from 'react';

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
  error,
  helpText,
  className = '',
  size = 'md',
}: InputProps) {
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }[size];

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-primary"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-field w-full ${sizeStyles} ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      
      {error && (
        <p className="text-sm text-danger flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-danger text-white text-xs flex items-center justify-center">!</span>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-muted">{helpText}</p>
      )}
    </div>
  );
}
