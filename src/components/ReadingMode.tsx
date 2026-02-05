import { useState, useEffect, useRef, useCallback } from 'react';
import { Book } from '@/types/book';
import {
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Robust worker configuration
const PDFJS_VERSION = '4.4.168';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

interface ReadingModeProps {
  book: Book;
  content: string;
  onClose: () => void;
  onUpdateProgress: (bookId: string, progress: number) => void;
  onAddReadingTime: (minutes: number) => void;
}

export function ReadingMode({ book, onClose, onUpdateProgress, onAddReadingTime }: ReadingModeProps) {
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [uiVisible, setUiVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Pacer State
  const [pacerEnabled, setPacerEnabled] = useState(false);
  const [pacerPaused, setPacerPaused] = useState(true);
  const [pacerSpeed, setPacerSpeed] = useState(250);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const wordsRef = useRef<any[]>([]);
  const indexRef = useRef<number>(0);
  const pacingRef = useRef<{ enabled: boolean, paused: boolean, speed: number }>({
    enabled: false, paused: true, speed: 250
  });

  const timerRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const uiTimeoutRef = useRef<number>(0);

  // Perspective state
  const [isHovered, setIsHovered] = useState(false);

  // Sync pacing refs
  useEffect(() => {
    pacingRef.current = { enabled: pacerEnabled, paused: pacerPaused, speed: pacerSpeed };
  }, [pacerEnabled, pacerPaused, pacerSpeed]);

  // Load PDF
  useEffect(() => {
    let active = true;
    const loadDoc = async () => {
      if (!book.pdfUrl) {
        setError("Missing document path.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument({
          url: book.pdfUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/cmaps/`,
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        if (!active) return;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        const saved = localStorage.getItem(`reading-progress-${book.id}`);
        setCurrentPage(saved ? parseInt(saved, 10) : 1);
        setLoading(false);
      } catch (err: any) {
        console.error("PDF Load Error:", err);
        setError(`Failed to load PDF: ${err.message}`);
        setLoading(false);
      }
    };
    loadDoc();
    return () => { active = false; };
  }, [book.pdfUrl, book.id]);

  // Cinematic Smart Fit Scale
  const getScale = useCallback((pageWidth: number, pageHeight: number) => {
    const vw = window.innerWidth * 0.95;
    const vh = window.innerHeight * 0.95;
    const scaleW = vw / pageWidth;
    const scaleH = vh / pageHeight;
    return Math.min(scaleW, scaleH);
  }, []);

  // Main Render Logic
  const render = useCallback(async () => {
    if (!pdfDocument || !canvasRef.current || !scrollRef.current) return;

    try {
      if (renderTaskRef.current) renderTaskRef.current.cancel();

      const page = await pdfDocument.getPage(currentPage);
      const viewportUnscaled = page.getViewport({ scale: 1 });

      const fitScale = getScale(viewportUnscaled.width, viewportUnscaled.height);
      const finalScale = fitScale * userZoom;

      // Ultra-Sharp Rendering Logic (Supersampling)
      // We use a high-quality multiplier (DPR * 1.5) to ensure text remains crisp even during transitions
      const dpr = (window.devicePixelRatio || 1) * 1.5;
      const viewport = page.getViewport({ scale: finalScale * dpr });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true // Low latency rendering
      });
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

      if (pCanvasRef.current) {
        pCanvasRef.current.width = canvas.width;
        pCanvasRef.current.height = canvas.height;
        pCanvasRef.current.style.width = canvas.style.width;
        pCanvasRef.current.style.height = canvas.style.height;
      }

      renderTaskRef.current = page.render({
        canvasContext: ctx,
        viewport: viewport
      });
      await renderTaskRef.current.promise;

      // Text Extraction
      const text = await page.getTextContent();
      const extracted: any[] = [];
      text.items.forEach((item: any) => {
        if (!item.str.trim()) return;
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const h = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
        const w = item.width * viewport.scale;
        const parts = item.str.split(/(\s+)/);
        let curX = tx[4];
        parts.forEach(p => {
          const pw = (p.length / item.str.length) * w;
          if (p.trim()) extracted.push({ word: p, x: curX, y: tx[5] - h, w: pw, h });
          curX += pw;
        });
      });
      extracted.sort((a, b) => Math.abs(a.y - b.y) < a.h / 2 ? a.x - b.x : a.y - b.y);
      wordsRef.current = extracted;
      indexRef.current = 0;
      setCurrentWordIndex(0);
      accumulatedRef.current = 0;

    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') console.error("Render error:", err);
    }
  }, [pdfDocument, currentPage, userZoom, getScale]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => { render(); };
    window.addEventListener('resize', handleResize);
    const timeout = setTimeout(render, 50);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [render]);

  // Animation Loop for Pacer - Extreme Precision
  const loop = useCallback((now: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const { enabled, paused, speed } = pacingRef.current;

    if (enabled && !paused && wordsRef.current.length > 0) {
      accumulatedRef.current += dt;
      const threshold = 60000 / speed;

      if (accumulatedRef.current >= threshold) {
        const skip = Math.floor(accumulatedRef.current / threshold);
        accumulatedRef.current %= threshold;

        indexRef.current = Math.min(wordsRef.current.length - 1, indexRef.current + skip);
        if (indexRef.current >= wordsRef.current.length - 1) setPacerPaused(true);
        if (now % 100 < 20) setCurrentWordIndex(indexRef.current);
      }
    }

    // DRAW PACE VISUALS
    const pCanvas = pCanvasRef.current;
    if (pCanvas && enabled) {
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        const w = wordsRef.current[indexRef.current];
        if (w) {
          const x = w.x;
          const y = w.y;
          const width = w.w;
          const height = w.h;

          // Searchlight Glow
          pCtx.fillStyle = 'rgba(255, 120, 0, 0.12)';
          pCtx.beginPath();
          pCtx.roundRect(x - 4, y, width + 8, height, 8);
          pCtx.fill();

          // Neon Underline
          pCtx.shadowBlur = 10;
          pCtx.shadowColor = 'rgba(255, 107, 0, 0.4)';
          pCtx.fillStyle = '#ff6b00';
          pCtx.beginPath();
          pCtx.roundRect(x, y + height + 2, width, 4, 2);
          pCtx.fill();
          pCtx.shadowBlur = 0;
        }
      }
    } else if (pCanvas) {
      pCanvas.getContext('2d')?.clearRect(0, 0, pCanvas.width, pCanvas.height);
    }

    timerRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    timerRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(timerRef.current);
  }, [loop]);

  // Time Tracking Logic
  const timeStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = now - timeStartRef.current;
      if (diffMs >= 60000) { // 1 minute
        onAddReadingTime(1);
        timeStartRef.current = now;
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [onAddReadingTime]);

  // Update Global Progress
  useEffect(() => {
    if (numPages > 0) {
      const progress = Math.round((currentPage / numPages) * 100);
      onUpdateProgress(book.id, progress);
    }
  }, [currentPage, numPages, book.id, onUpdateProgress]);

  // Page Controls
  const prev = useCallback(() => setCurrentPage(p => Math.max(1, p - 1)), []);
  const next = useCallback(() => setCurrentPage(p => Math.min(numPages, p + 1)), [numPages]);

  // Zoom Logic
  const zoomIn = () => setUserZoom(z => Math.min(3, z + 0.1));
  const zoomOut = () => setUserZoom(z => Math.max(0.3, z - 0.1));
  const zoomReset = () => setUserZoom(1.0);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === ' ') { e.preventDefault(); setPacerPaused(p => !p); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next, onClose]);

  // Aggressive UI Auto-Hide (2 Seconds)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setUiVisible(true);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);

      // If cursor is on the page content, hide UI after 2 seconds
      uiTimeoutRef.current = window.setTimeout(() => {
        const target = e.target as HTMLElement;
        const isOverUI = target.closest('.zen-sidebar') || target.closest('.pacer-hud');
        if (!isOverUI) {
          setUiVisible(false);
        }
      }, 2000);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 select-none overflow-hidden bg-[#050505] font-sans flex items-center justify-center"
      id="reading-stage"
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        #reading-stage {
          perspective: 2500px;
        }
        #zen-page {
          transform: rotateX(4deg) rotateY(-4deg);
          box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s ease;
          background: white;
          position: relative;
          z-index: 10;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          will-change: transform;
        }
        #zen-page.straight {
          transform: rotateX(0deg) rotateY(0deg) translateZ(50px);
          box-shadow: 0 60px 150px rgba(0,0,0,1);
        }
        canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          display: block;
        }
        .ui-fade {
            transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0, 0, 1);
        }
        .ui-hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateX(20px);
        }
      `}</style>

      {/* ZEN SIDE PANEL - Expert Controls */}
      <aside
        className={cn(
          "fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 p-2 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/5 ui-fade zen-sidebar",
          !uiVisible && "ui-hidden translate-x-10"
        )}
      >
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white" title="Close"><X className="w-5 h-5" /></button>
        <div className="h-px w-8 bg-white/10 mx-auto" />
        <button onClick={zoomIn} className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={() => setUserZoom(1.0)} className="text-[10px] font-black text-white/20 h-8 flex items-center justify-center hover:text-white transition-colors">FIT</button>
        <button onClick={zoomOut} className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white"><ZoomOut className="w-5 h-5" /></button>
        <div className="h-px w-8 bg-white/10 mx-auto" />
        <button
          onMouseEnter={() => setPacerEnabled(true)}
          onClick={() => setPacerEnabled(!pacerEnabled)}
          className={cn(
            "p-3 rounded-2xl transition-all",
            pacerEnabled ? "text-orange-500 bg-orange-500/10" : "text-white/40 hover:text-white"
          )}
        >
          <Sparkles className="w-5 h-5" />
        </button>
        <button onClick={toggleFullscreen} className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </aside>

      {/* EXPERT PACER HUD - Floating Glass Pill */}
      {pacerEnabled && (
        <div className={cn(
          "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-6 py-3 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl ui-fade pacer-hud",
          !uiVisible && "ui-hidden translate-y-10"
        )}>
          <button
            onClick={() => setPacerPaused(!pacerPaused)}
            className="w-12 h-12 flex items-center justify-center bg-orange-600 text-white rounded-full shadow-lg active:scale-90 transition-all"
          >
            {pacerPaused ? <Play className="w-6 h-6 fill-current ml-1" /> : <Pause className="w-6 h-6 fill-current" />}
          </button>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums text-white/90">{pacerSpeed}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">WPM</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setPacerSpeed(s => Math.max(50, s - 25))} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setPacerSpeed(s => Math.min(2000, s + 25))} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={() => { indexRef.current = 0; setCurrentWordIndex(0); }} className="p-2 text-white/20 hover:text-white/80 transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* THE READING SECTION (Maximum Focus) */}
      <main
        ref={scrollRef}
        className="w-full h-full flex items-center justify-center overflow-auto hide-scrollbar cursor-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-white/10 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-[10px] font-black tracking-[0.5em] uppercase">Stage Readying</span>
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10">
            <p className="text-white/40 font-bold mb-8 uppercase tracking-widest">{error}</p>
            <Button onClick={onClose} variant="ghost" className="text-orange-500 hover:bg-orange-500/10 rounded-full">Return Home</Button>
          </div>
        ) : (
          <div
            id="zen-page"
            className={cn(isHovered && "straight")}
            style={{
              transform: `${isHovered ? 'rotateX(0deg) rotateY(0deg) translateZ(20px)' : 'rotateX(4deg) rotateY(-4deg)'}`,
              transformOrigin: 'center center'
            }}
          >
            <canvas ref={canvasRef} className="block shadow-inner" />
            <canvas ref={pCanvasRef} className="absolute inset-0 pointer-events-none mix-blend-multiply" />
          </div>
        )}
      </main>

      {/* Minimal Progressive Indicator */}
      <footer className="fixed bottom-6 w-full flex justify-center pointer-events-none">
        <div className="text-[9px] font-black tracking-[0.8em] text-white/10 uppercase transition-opacity duration-1000" style={{ opacity: uiVisible ? 0.3 : 0.05 }}>
          {currentPage} / {numPages}
        </div>
      </footer>

      {/* Invisible Navigation */}
      <div onClick={prev} className="absolute left-0 top-0 bottom-0 w-20 z-0 cursor-w-resize" />
      <div onClick={next} className="absolute right-0 top-0 bottom-0 w-20 z-0 cursor-e-resize" />
    </div>
  );
}
