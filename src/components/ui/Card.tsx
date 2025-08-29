import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
  hover?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const variantStyles = {
  default: 'bg-white border border-neutral-200 shadow-card',
  outlined: 'bg-white border-2 border-neutral-200',
  elevated: 'bg-white border border-neutral-100 shadow-lg'
};

export default function Card({ 
  children, 
  padding = 'md',
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}: CardProps) {
  const cardClasses = [
    // Base styles
    'rounded-xl transition-all duration-200',
    
    // Variant styles
    variantStyles[variant],
    
    // Padding
    paddingStyles[padding],
    
    // Hover effect
    hover ? 'hover:shadow-card-hover hover:border-neutral-300' : '',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}