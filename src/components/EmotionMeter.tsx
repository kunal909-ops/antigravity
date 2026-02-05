import { cn } from '@/lib/utils';

interface EmotionMeterProps {
  tension: number;
  emotion: number;
  className?: string;
  showLabels?: boolean;
}

export function EmotionMeter({ 
  tension, 
  emotion, 
  className,
  showLabels = false 
}: EmotionMeterProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Tension meter */}
      <div className="space-y-1">
        {showLabels && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tension</span>
            <span>{tension}%</span>
          </div>
        )}
        <div className="tension-meter">
          <div 
            className="tension-fill" 
            style={{ width: `${tension}%` }}
          />
        </div>
      </div>
      
      {/* Emotional flow bar */}
      <div className="emotion-bar" style={{ opacity: emotion / 100 }} />
    </div>
  );
}
