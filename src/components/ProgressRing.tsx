import { cn } from '@/lib/utils';
import { Genre } from '@/types/book';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  genre?: Genre;
  className?: string;
  children?: React.ReactNode;
}

const genreColors: Record<Genre, string> = {
  thriller: 'stroke-genre-thriller',
  classic: 'stroke-genre-classic',
  emotional: 'stroke-genre-emotional',
  mystery: 'stroke-genre-mystery',
  romance: 'stroke-genre-romance',
  scifi: 'stroke-genre-scifi',
};

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 4,
  genre = 'classic',
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="progress-ring"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-progress-bg"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('progress-ring-circle', genreColors[genre])}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
