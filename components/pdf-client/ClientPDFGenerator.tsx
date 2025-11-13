'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import MinimalTestDocument from '../pdf/MinimalTestDocument';
import { Button } from '../ui/button';
import { FileDown, Loader2 } from 'lucide-react';

interface ClientPDFGeneratorProps {
  auditId: string;
  reportData: {
    propertyAddress: string;
    landlordName: string;
    overallScore: number;
  };
}

export function ClientPDFGenerator({ auditId, reportData }: ClientPDFGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      setError('');
      
      console.log('[Client PDF] Generating PDF in browser...');
      
      // Generate PDF in the browser using @react-pdf/renderer
      const doc = <MinimalTestDocument 
        propertyAddress={reportData.propertyAddress}
        landlordName={reportData.landlordName}
        overallScore={reportData.overallScore}
      />;
      
      const blob = await pdf(doc).toBlob();
      
      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landlord-audit-report-${auditId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('[Client PDF] ✅ PDF generated successfully');
    } catch (error) {
      console.error('[Client PDF] Error:', error);
      setError((error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={generating}
        className="bg-green-600 hover:bg-green-700"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" />
            Generate PDF (Client-Side)
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        PDF is generated in your browser (no server required)
      </p>
    </div>
  );
}

