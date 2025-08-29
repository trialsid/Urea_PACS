import { InputHTMLAttributes, ReactNode } from 'react';
import Icon from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  suffix?: ReactNode;
  variant?: 'default' | 'success' | 'error';
}

const variantStyles = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500'
};

export default function Input({
  label,
  error,
  helpText,
  icon,
  iconPosition = 'left',
  suffix,
  variant = 'default',
  className = '',
  id,
  ...props
}: InputProps) {
  // Auto-generate ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine variant based on error state
  const effectiveVariant = error ? 'error' : variant;

  const inputClasses = [
    // Base styles
    'block w-full rounded-lg border px-3 py-2 text-base placeholder-neutral-400 transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    
    // Variant styles
    variantStyles[effectiveVariant],
    
    // Icon padding adjustments
    icon && iconPosition === 'left' ? 'pl-10' : '',
    icon && iconPosition === 'right' ? 'pr-10' : '',
    suffix ? 'pr-10' : '',
    
    // Disabled state
    props.disabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <Icon 
              name={icon} 
              size="sm" 
              className={effectiveVariant === 'error' ? 'text-error-500' : 'text-neutral-400'} 
            />
          </div>
        )}
        
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600 flex items-center gap-1">
          <Icon name="alertCircle" size="xs" />
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-500">
          {helpText}
        </p>
      )}
    </div>
  );
}