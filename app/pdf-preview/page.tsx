'use client';

// PDF Preview Page - For development/testing
// Displays PDF in real-time with auto-refresh capability
import { useState, useEffect, useRef } from 'react';

export default function PDFPreviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const loadPDF = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pdf-preview');
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPDF();
    
    // Cleanup on unmount
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAutoRefresh = (enabled: boolean) => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    
    if (enabled) {
      autoRefreshRef.current = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 2000); // Refresh every 2 seconds
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">PDF Preview</h1>
          <span className="text-sm text-gray-500">Development Mode</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Generating...' : 'Refresh PDF'}
          </button>
          
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Auto-refresh (2s)</span>
          </label>
          
          <a
            href="/api/pdf-preview"
            download="preview.pdf"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 relative bg-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating PDF...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="PDF Preview"
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 text-sm text-blue-800">
        <p>
          <strong>💡 Tip:</strong> Edit files in <code className="bg-blue-100 px-1 rounded">lib/pdf-client/</code> and 
          click "Refresh PDF" or enable auto-refresh to see changes in real-time.
        </p>
      </div>
    </div>
  );
}


