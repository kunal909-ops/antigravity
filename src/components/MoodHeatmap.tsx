import { cn } from '@/lib/utils';
import { MoodEntry } from '@/types/book';

interface MoodHeatmapProps {
  data: MoodEntry[];
  className?: string;
}

const moodColors: Record<string, string> = {
  calm: 'bg-emotion-calm',
  tense: 'bg-emotion-tense',
  joyful: 'bg-emotion-joy',
  melancholic: 'bg-emotion-sadness',
};

export function MoodHeatmap({ data, className }: MoodHeatmapProps) {
  return (
    <div className={cn('flex gap-1.5 justify-center', className)}>
      {data.map((entry, index) => (
        <div
          key={index}
          className={cn(
            'heatmap-cell w-8 h-8 rounded-lg',
            moodColors[entry.mood]
          )}
          style={{ opacity: 0.3 + (entry.intensity / 100) * 0.7 }}
          title={`${entry.date}: ${entry.mood}`}
        />
      ))}
    </div>
  );
}
