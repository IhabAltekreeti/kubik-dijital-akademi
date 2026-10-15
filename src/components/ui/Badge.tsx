type BadgeColor = 'brand' | 'navy' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  navy: 'bg-navy-100 text-navy-700 border-navy-200',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  error: 'bg-error-50 text-error-700 border-error-100',
  neutral: 'bg-navy-50 text-navy-600 border-navy-100',
};

export default function Badge({ color = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorStyles[color],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
