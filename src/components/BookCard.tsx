import { cn } from '@/lib/utils';
import { Book, Genre } from '@/types/book';
import { ProgressRing } from './ProgressRing';
import { FileText, Trash2 } from 'lucide-react';

interface BookCardProps {
  book: Book;
  variant?: 'featured' | 'grid';
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

const genreAccentClass: Record<Genre, string> = {
  thriller: 'from-red-500/10 to-red-600/5',
  classic: 'from-amber-500/10 to-amber-600/5',
  emotional: 'from-indigo-500/10 to-indigo-600/5',
  mystery: 'from-purple-500/10 to-purple-600/5',
  romance: 'from-pink-500/10 to-pink-600/5',
  scifi: 'from-cyan-500/10 to-cyan-600/5',
};

const genreTextClass: Record<Genre, string> = {
  thriller: 'text-red-600 dark:text-red-400',
  classic: 'text-amber-700 dark:text-amber-400',
  emotional: 'text-indigo-600 dark:text-indigo-400',
  mystery: 'text-purple-600 dark:text-purple-400',
  romance: 'text-pink-600 dark:text-pink-400',
  scifi: 'text-cyan-600 dark:text-cyan-400',
};

// Elegant placeholder cover for PDF books
function PdfCover({ title, genre, size = 'normal' }: { title: string; genre: Genre; size?: 'normal' | 'small' }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center bg-gradient-to-br',
      genreAccentClass[genre],
      'bg-card border border-border/50',
      size === 'normal' 
        ? 'h-44 w-28 rounded-sm p-4' 
        : 'h-full w-full rounded-sm p-3'
    )}>
      <FileText className={cn(
        genreTextClass[genre],
        size === 'normal' ? 'h-8 w-8 mb-3 opacity-60' : 'h-5 w-5 mb-2 opacity-60'
      )} />
      <p className={cn(
        'font-reading font-medium text-center line-clamp-3 text-foreground/80',
        size === 'normal' ? 'text-sm' : 'text-xs'
      )}>
        {title}
      </p>
    </div>
  );
}

export function BookCard({ book, variant = 'grid', onClick, onDelete, className }: BookCardProps) {
  const hasCover = book.cover && book.cover.length > 0;

  if (variant === 'featured') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group relative w-full text-left transition-all duration-300',
          'bg-card rounded-2xl p-6',
          'hover:shadow-lg hover:shadow-foreground/5',
          'active:scale-[0.99]',
          className
        )}
      >
        <div className="flex gap-6">
          {/* Cover with progress ring - Apple Books style shadow */}
          <div className="relative flex-shrink-0">
            <ProgressRing
              progress={book.progress}
              size={180}
              strokeWidth={3}
              genre={book.genre}
            >
              <div className="relative">
                {hasCover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="h-44 w-28 rounded-sm object-cover"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), -3px 0 8px rgba(0,0,0,0.08)'
                    }}
                  />
                ) : (
                  <PdfCover title={book.title} genre={book.genre} />
                )}
                {/* Book spine effect */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-foreground/10 to-transparent rounded-l-sm" />
              </div>
            </ProgressRing>
          </div>

          {/* Book info */}
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <div className="mb-4">
              <h2 className="font-reading text-xl font-semibold text-foreground leading-tight mb-1 truncate">
                {book.title}
              </h2>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>

            {/* Progress indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{book.progress}%</span>
              </div>
              
              {/* Clean progress bar */}
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${book.progress}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Chapter {book.currentChapter} of {book.totalChapters}
              </p>
            </div>

            {/* Resume button */}
            <div className="mt-5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-transform group-hover:scale-[1.02]">
                Continue Reading
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Grid variant - Apple Books style
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          'relative w-full transition-all duration-300',
          'hover:-translate-y-1',
          'active:scale-[0.98]',
          className
        )}
      >
        {/* Cover image with realistic book shadow */}
        <div 
          className="relative aspect-[2/3] overflow-hidden rounded-sm bg-muted"
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08), -2px 0 6px rgba(0,0,0,0.06)'
          }}
        >
          {hasCover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <PdfCover title={book.title} genre={book.genre} size="small" />
          )}
          
          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-foreground/15 to-transparent" />
          
          {/* Progress overlay - subtle */}
          {book.progress > 0 && book.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Title below - Apple Books style */}
        <div className="mt-2.5 text-left px-0.5">
          <h3 className="font-reading text-sm font-medium text-foreground line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
        </div>
      </button>

      {/* Delete button - subtle, appears on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-foreground/90 text-background opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:scale-110 z-10 shadow-lg"
          title="Remove from library"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}