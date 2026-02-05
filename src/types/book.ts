export type Genre = 
  | 'thriller' 
  | 'classic' 
  | 'emotional' 
  | 'mystery' 
  | 'romance' 
  | 'scifi';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: Genre;
  progress: number; // 0-100
  currentChapter: number;
  totalChapters: number;
  emotionalTone: number; // 0-100, calm to intense
  tensionLevel: number; // 0-100
  wordCount: number;
  estimatedReadTime: number; // minutes
  lastReadAt?: Date;
  pdfUrl?: string;
}

export interface ReadingStats {
  totalBooksRead: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number; // minutes
  averageSessionLength: number; // minutes
  genrePreferences: Record<Genre, number>;
  moodHistory: MoodEntry[];
  weeklyProgress: WeeklyProgress[];
}

export interface MoodEntry {
  date: string;
  mood: 'calm' | 'tense' | 'joyful' | 'melancholic';
  intensity: number;
}

export interface WeeklyProgress {
  day: string;
  minutes: number;
  pagesRead: number;
}

export interface PacerSettings {
  enabled: boolean;
  speed: number; // words per minute
  color: string;
  style: 'underline' | 'highlight' | 'glow';
}

export interface ReaderSettings {
  fontSize: 'sm' | 'base' | 'lg';
  fontFamily: 'serif' | 'sans';
  theme: 'light' | 'sepia' | 'dark';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  pacer: PacerSettings;
  reducedMotion: boolean;
}
