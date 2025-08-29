import { ReactNode, ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white border-transparent',
  secondary: 'bg-neutral-100 hover:bg-neutral-200 focus:ring-neutral-500 text-neutral-700 border-neutral-300',
  success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white border-transparent',
  warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500 text-white border-transparent',
  danger: 'bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-neutral-100 focus:ring-neutral-500 text-neutral-600 border-transparent'
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export default function Button({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonClasses = [
    // Base styles
    'inline-flex items-center justify-center font-medium rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    // Size styles
    sizeStyles[size],
    
    // Variant styles
    variantStyles[variant],
    
    // Full width
    fullWidth ? 'w-full' : '',
    
    // Disabled state
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ');

  const iconSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Icon name="loader" size={iconSize} className="mr-2" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon name={icon} size={iconSize} className="mr-2" />
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={iconSize} className="ml-2" />
      )}
    </button>
  );
}