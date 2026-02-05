import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Import worker from local package to avoid external CDN security risks
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set the worker source to use local bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
interface ParsedPdf {
  title: string;
  text: string;
  pageCount: number;
  wordCount: number;
}

interface UsePdfParserReturn {
  parsePdf: (file: File) => Promise<ParsedPdf>;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export function usePdfParser(): UsePdfParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const parsePdf = useCallback(async (file: File): Promise<ParsedPdf> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pageCount = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Process text items with proper spacing
        let lastY: number | null = null;
        let pageText = '';
        
        for (const item of textContent.items) {
          const textItem = item as any;
          const currentY = textItem.transform ? textItem.transform[5] : null;
          
          // Detect line breaks based on Y position changes
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
            // New line detected - check if it's a paragraph break (larger gap)
            if (Math.abs(currentY - lastY) > 15) {
              pageText += '\n\n';
            } else {
              // Same paragraph, just add space if needed
              if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                pageText += ' ';
              }
            }
          } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n') && textItem.str) {
            pageText += ' ';
          }
          
          pageText += textItem.str;
          lastY = currentY;
        }
        
        fullText += pageText + '\n\n';
        setProgress(Math.round((i / pageCount) * 100));
      }

      const title = file.name.replace(/\.pdf$/i, '');
      const wordCount = fullText.trim().split(/\s+/).length;

      setIsLoading(false);
      setProgress(100);

      return {
        title,
        text: fullText.trim(),
        pageCount,
        wordCount,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse PDF';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  return { parsePdf, isLoading, error, progress };
}
