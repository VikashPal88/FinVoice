'use client';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: color ? `${color}15` : 'var(--surface)',
        color: color || 'var(--foreground)',
        border: `1px solid ${color ? `${color}30` : 'var(--glass-border)'}`,
      }}
    >
      {children}
    </span>
  );
}
