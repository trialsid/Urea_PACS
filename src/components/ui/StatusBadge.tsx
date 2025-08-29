import { ReactNode } from 'react';
import Icon from './Icon';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'pending' | 'success' | 'warning' | 'error';
  children: ReactNode;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusStyles = {
  online: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
    dot: 'bg-success-500',
    icon: 'checkCircle'
  },
  offline: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    dot: 'bg-neutral-500',
    icon: 'xCircle'
  },
  pending: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
    dot: 'bg-warning-500',
    icon: 'loader'
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
    dot: 'bg-success-500',
    icon: 'checkCircle'
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
    dot: 'bg-warning-500',
    icon: 'alertCircle'
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    border: 'border-error-200',
    dot: 'bg-error-500',
    icon: 'xCircle'
  }
};

const sizeStyles = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1',
    dotSize: { width: '6px', height: '6px' }
  },
  md: {
    text: 'text-sm',
    padding: 'px-2.5 py-1.5',
    gap: 'gap-1.5',
    dotSize: { width: '8px', height: '8px' }
  }
};

export default function StatusBadge({ 
  status, 
  children, 
  showIcon = false,
  size = 'md'
}: StatusBadgeProps) {
  const statusStyle = statusStyles[status];
  const sizeStyle = sizeStyles[size];

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}
      ${sizeStyle.text} ${sizeStyle.padding} ${sizeStyle.gap}
    `}>
      {showIcon ? (
        <Icon name={statusStyle.icon} size="xs" />
      ) : (
        <span 
          className={`rounded-full ${statusStyle.dot}`}
          style={sizeStyle.dotSize}
        ></span>
      )}
      {children}
    </span>
  );
}