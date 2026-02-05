import { useState, useEffect, useCallback } from 'react';
import { Book, ReadingStats } from '@/types/book';

const STORAGE_KEY = 'reading-app-library';
const CONTENT_KEY = 'reading-app-content';
const STATS_KEY = 'reading-app-stats';

interface StoredLibrary {
  books: Book[];
  lastUpdated: string;
}

interface BookContent {
  [bookId: string]: string;
}

const DEFAULT_STATS: ReadingStats = {
  totalBooksRead: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalReadingTime: 0,
  averageSessionLength: 0,
  genrePreferences: {
    thriller: 0,
    classic: 0,
    emotional: 0,
    mystery: 0,
    romance: 0,
    scifi: 0
  },
  moodHistory: [],
  weeklyProgress: []
};

export function useLocalLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookContents, setBookContents] = useState<BookContent>({});
  const [stats, setStats] = useState<ReadingStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedLibrary = localStorage.getItem(STORAGE_KEY);
    const storedContent = localStorage.getItem(CONTENT_KEY);
    const storedStats = localStorage.getItem(STATS_KEY);

    if (storedLibrary) {
      try {
        const parsed = JSON.parse(storedLibrary);
        const booksArray = (parsed && Array.isArray(parsed.books)) ? parsed.books : [];
        const booksWithDates = booksArray
          .filter((book: any) => book && !['1', '2', '3', '4', '5', '6'].includes(book.id))
          .map((book: any) => ({
            ...book,
            lastReadAt: book.lastReadAt ? new Date(book.lastReadAt) : undefined
          }));
        setBooks(booksWithDates);
      } catch (err) {
        console.error("Error parsing stored library:", err);
        setBooks([]);
      }
    }

    if (storedContent) {
      try {
        const parsed = JSON.parse(storedContent);
        const filteredContent: BookContent = {};
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([id, content]) => {
            if (!['1', '2', '3', '4', '5', '6'].includes(id)) {
              filteredContent[id] = content as string;
            }
          });
        }
        setBookContents(filteredContent);
      } catch (err) {
        console.error("Error parsing stored content:", err);
        setBookContents({});
      }
    }

    if (storedStats) {
      try {
        const parsed = JSON.parse(storedStats);
        if (parsed && typeof parsed === 'object') {
          setStats({ ...DEFAULT_STATS, ...parsed });
        }
      } catch (err) {
        console.error("Error parsing stored stats:", err);
        setStats(DEFAULT_STATS);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when books change
  useEffect(() => {
    if (isLoaded) {
      const library: StoredLibrary = {
        books,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    }
  }, [books, isLoaded]);

  // Save content when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(bookContents));
    }
  }, [bookContents, isLoaded]);

  // Save stats when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  }, [stats, isLoaded]);

  const updateStats = useCallback((updates: Partial<ReadingStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  }, []);

  const addBook = useCallback((book: Book, content: string) => {
    setBooks(prev => [book, ...prev]);
    setBookContents(prev => ({ ...prev, [book.id]: content }));
  }, []);

  const updateBookProgress = useCallback((bookId: string, progress: number) => {
    setBooks(prev => {
      const newBooks = prev.map(book => {
        if (book.id === bookId) {
          const wasFinished = book.progress >= 100;
          const isFinished = progress >= 100;

          if (!wasFinished && isFinished) {
            setStats(s => ({ ...s, totalBooksRead: s.totalBooksRead + 1 }));
          }

          return { ...book, progress, lastReadAt: new Date() };
        }
        return book;
      });
      return newBooks;
    });

    // Handle Streak logic
    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('last-reading-session-date');

    if (lastSessionDate !== today) {
      setStats(s => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isStreakContinued = lastSessionDate === yesterday.toDateString();
        const newStreak = isStreakContinued ? s.currentStreak + 1 : 1;

        return {
          ...s,
          currentStreak: newStreak,
          longestStreak: Math.max(s.longestStreak, newStreak)
        };
      });
      localStorage.setItem('last-reading-session-date', today);
    }
  }, []);

  const addReadingTime = useCallback((minutes: number) => {
    setStats(s => ({ ...s, totalReadingTime: s.totalReadingTime + minutes }));
  }, []);

  const removeBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
    setBookContents(prev => {
      const { [bookId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getBookContent = useCallback((bookId: string): string => {
    return bookContents[bookId] || '';
  }, [bookContents]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONTENT_KEY);
    localStorage.removeItem(STATS_KEY);
    setBooks([]);
    setBookContents({});
    setStats(DEFAULT_STATS);
  }, []);

  return {
    books,
    stats,
    isLoaded,
    addBook,
    updateBookProgress,
    addReadingTime,
    removeBook,
    getBookContent,
    clearAllData,
  };
}
