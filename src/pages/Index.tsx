import { useState } from 'react';
import { BookCard } from '@/components/BookCard';
import { GenreChart } from '@/components/GenreChart';
import { MoodHeatmap } from '@/components/MoodHeatmap';
import { StreakRibbon } from '@/components/StreakRibbon';
import { ReadingMode } from '@/components/ReadingMode';
import { PdfUploadDialog } from '@/components/PdfUploadDialog';
import { sampleStats, sampleBooks, sampleChapterContent } from '@/data/sampleBooks';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { Book } from '@/types/book';
import { Library, BarChart3, Clock, Plus, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { books, stats, isLoaded, addBook, updateBookProgress, addReadingTime, removeBook, getBookContent, clearAllData } = useLocalLibrary();

  // Current book is the most recently read
  const currentBook = books.find(b => b.lastReadAt) || books[0];
  const libraryBooks = currentBook ? books.filter(b => b.id !== currentBook.id) : books;

  if (selectedBook) {
    return (
      <ReadingMode
        book={selectedBook}
        content={getBookContent(selectedBook.id)}
        onClose={() => setSelectedBook(null)}
        onUpdateProgress={updateBookProgress}
        onAddReadingTime={addReadingTime}
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Header - Pro/Dark */}
      <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#252525]">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-bold tracking-tight text-white/90">Whisper Reader</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={clearAllData}
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full px-4"
          >
            Clear Data
          </Button>
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 shadow-lg shadow-orange-900/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Import PDF
          </Button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Hero Section / Continue Reading */}
          {currentBook && (
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#2a2a2a] rounded-xl p-8 border border-white/5 flex gap-8 items-start shadow-2xl">
                {/* Big Cover Art Placeholder or Icon */}
                <div className="w-32 h-44 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-white/10 shadow-lg flex-shrink-0">
                  <BookOpen className="h-10 w-10 text-white/20" />
                </div>
                <div className="flex-1 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Continue Reading
                    </span>
                    <span className="text-xs text-white/40">• Last read {currentBook.lastReadAt?.toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentBook.title}</h2>
                  <p className="text-white/60 text-lg mb-6 max-w-2xl">{currentBook.author}</p>

                  <div className="flex items-center gap-6">
                    <Button
                      onClick={() => setSelectedBook(currentBook)}
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 font-medium"
                    >
                      Resume
                    </Button>
                    <div className="flex flex-col gap-1 w-48">
                      <div className="flex justify-between text-xs text-white/50">
                        <span>Progress</span>
                        <span>{currentBook.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${currentBook.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Library Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Library className="h-5 w-5 text-white/50" />
                Your Library
              </h3>
              <span className="text-sm text-white/40">{books.length} items</span>
            </div>

            {libraryBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {libraryBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group relative bg-[#2a2a2a] rounded-lg border border-white/5 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="aspect-[1/1.4] bg-[#1a1a1a] relative flex items-center justify-center group-hover:bg-[#151515] transition-colors">
                      <BookOpen className="h-8 w-8 text-white/10 group-hover:text-white/30 transition-colors" />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="font-semibold text-white/90 text-sm leading-tight line-clamp-2">{book.title}</h4>
                        <p className="text-xs text-white/50 mt-1 truncate">{book.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/5">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Plus className="h-6 w-6 text-white/40" />
                </div>
                <h3 className="text-lg font-medium text-white/80 mb-1">Library Empty</h3>
                <p className="text-white/40 text-sm mb-6 max-w-sm">
                  Drag and drop your PDF files here or use the import button to get started.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowUploadDialog(true)} variant="secondary" className="rounded-full">Import PDF</Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 text-white hover:bg-white/5"
                    onClick={() => {
                      const demoBook = { ...sampleBooks[0], id: `demo-${Date.now()}` };
                      addBook(demoBook, sampleChapterContent);
                    }}
                  >
                    Load Demo
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Stats / Insights Row (Simplified) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
              <h4 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Reading Time
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.floor(stats.totalReadingTime / 60)}h {Math.floor(stats.totalReadingTime % 60)}m
                <span className="text-lg text-white/40 font-normal ml-2">total</span>
              </div>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
              <h4 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Streak
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.currentStreak}
                <span className="text-lg text-white/40 font-normal ml-2">days</span>
              </div>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
              <h4 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Books Read
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalBooksRead}
                <span className="text-lg text-white/40 font-normal ml-2">finished</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* PDF Upload Dialog */}
      <PdfUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onBookAdded={(book, content) => {
          addBook(book, content);
          setSelectedBook(book); // Automatically open the reader
        }}
      />
    </div>
  );
}
