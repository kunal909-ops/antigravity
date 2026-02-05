import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileUp, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { usePdfParser } from '@/hooks/usePdfParser';
import { Book, Genre } from '@/types/book';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2D]; // %PDF-

// Validate PDF file by checking magic bytes and file size
const validatePdfFile = async (file: File): Promise<{ valid: boolean; error?: string; arrayBuffer?: ArrayBuffer }> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  try {
    // Read file and check magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const header = new Uint8Array(arrayBuffer.slice(0, 5));

    const isValidPdf = PDF_MAGIC_BYTES.every((byte, i) => header[i] === byte);
    if (!isValidPdf) {
      return { valid: false, error: 'Invalid PDF file format' };
    }

    return { valid: true, arrayBuffer };
  } catch {
    return { valid: false, error: 'Failed to read file' };
  }
};

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: (book: Book, content: string) => void;
}

const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: 'thriller', label: 'Thriller' },
  { value: 'classic', label: 'Classic' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'scifi', label: 'Sci-Fi' },
];

export function PdfUploadDialog({ open, onOpenChange, onBookAdded }: PdfUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre>('classic');
  const [status, setStatus] = useState<'idle' | 'validating' | 'parsing' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { parsePdf, isLoading, error, progress } = usePdfParser();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    setValidationError(null);
    setStatus('validating');

    // Validate PDF file (magic bytes and size)
    const validation = await validatePdfFile(file);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid PDF file');
      setStatus('error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelection(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelection(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('parsing');
    setValidationError(null);

    try {
      const result = await parsePdf(selectedFile);

      const newBook: Book = {
        id: `pdf-${Date.now()}`,
        title: result.title,
        author: 'Unknown Author',
        cover: '',
        genre: selectedGenre,
        progress: 0,
        currentChapter: 1,
        totalChapters: result.pageCount,
        emotionalTone: 50,
        tensionLevel: 50,
        wordCount: result.wordCount,
        estimatedReadTime: Math.round(result.wordCount / 250),
        lastReadAt: new Date(),
        pdfUrl: URL.createObjectURL(selectedFile),
      };

      setStatus('success');

      setTimeout(() => {
        onBookAdded(newBook, result.text);
        resetState();
        onOpenChange(false);
      }, 800);

    } catch (err) {
      setStatus('error');
      setValidationError(err instanceof Error ? err.message : 'Failed to parse PDF');
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setStatus('idle');
    setSelectedGenre('classic');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Import PDF Book</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a PDF file to add it to your library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-normal',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50',
              selectedFile && 'border-primary/50 bg-primary/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <File className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-muted">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Drop PDF here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF files up to 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Genre Selection */}
          {selectedFile && status === 'idle' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-foreground">
                Select Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => setSelectedGenre(genre.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-normal',
                      selectedGenre === genre.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {status === 'parsing' && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing PDF...
                </span>
                <span className="text-foreground font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 animate-fade-in">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Book added to library!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive animate-fade-in">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{validationError || error || 'Failed to parse PDF'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading || status === 'success'}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Add to Library'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
