import { Genre } from '@/types/book';
import { cn } from '@/lib/utils';

interface GenreChartProps {
  data: Record<Genre, number>;
  className?: string;
}

const genreLabels: Record<Genre, string> = {
  thriller: 'Thriller',
  classic: 'Classic',
  emotional: 'Emotional',
  mystery: 'Mystery',
  romance: 'Romance',
  scifi: 'Sci-Fi',
};

const genreColors: Record<Genre, string> = {
  thriller: 'bg-genre-thriller',
  classic: 'bg-genre-classic',
  emotional: 'bg-genre-emotional',
  mystery: 'bg-genre-mystery',
  romance: 'bg-genre-romance',
  scifi: 'bg-genre-scifi',
};

export function GenreChart({ data, className }: GenreChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const sortedGenres = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) as [Genre, number][];

  return (
    <div className={cn('space-y-3', className)}>
      {sortedGenres.map(([genre, value]) => {
        const percentage = Math.round((value / total) * 100);
        return (
          <div key={genre} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{genreLabels[genre]}</span>
              <span className="font-medium text-foreground">{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all duration-slow', genreColors[genre])}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
