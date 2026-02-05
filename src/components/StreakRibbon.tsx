import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakRibbonProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakRibbon({ currentStreak, longestStreak, className }: StreakRibbonProps) {
  const progress = Math.min((currentStreak / longestStreak) * 100, 100);
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-progress-ring" />
        <span className="text-2xl font-semibold text-foreground">{currentStreak}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>
      
      <div className="streak-ribbon h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-progress-ring rounded-full transition-all duration-slow"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Best: {longestStreak} days
      </p>
    </div>
  );
}
