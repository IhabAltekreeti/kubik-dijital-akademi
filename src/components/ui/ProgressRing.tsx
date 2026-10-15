import { type LucideIcon } from 'lucide-react';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  icon?: LucideIcon;
}

export default function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  label,
  icon: Icon,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-navy-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-brand-600 transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {Icon ? (
          <Icon className="h-5 w-5 text-brand-600" />
        ) : (
          <span className="text-lg font-semibold text-navy-800">
            {Math.round(percentage * 100)}%
          </span>
        )}
        {label && <span className="text-2xs text-navy-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
