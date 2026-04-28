import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice } from '../../features/billing/domain/Invoice.types';

interface UseInvoicePdfDownloadReturn {
  downloadPdf: (invoice: Invoice) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para descargar factura como PDF
 * Utiliza html2canvas para capturar elementos y jsPDF para generar el PDF
 */
export function useInvoicePdfDownload(): UseInvoicePdfDownloadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async (invoice: Invoice) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!pdfRef.current) {
        throw new Error('No se puede acceder al elemento PDF');
      }

      // Capturar el elemento como imagen
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: pdfRef.current.scrollHeight,
      });

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');

      let yPosition = margin;

      // Agregar imagen(s) al PDF (con soporte para múltiples páginas)
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);

      let heightLeft = imgHeight - (pageHeight - 2 * margin);
      let pageCount = 1;

      while (heightLeft > 0) {
        yPosition = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        heightLeft -= pageHeight - 2 * margin;
        pageCount++;
      }

      // Descargar PDF
      const fileName = `${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al descargar la factura como PDF';
      setError(errorMessage);
      console.error('Error downloading PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    downloadPdf,
    isLoading,
    error,
    pdfRef,
  } as UseInvoicePdfDownloadReturn & { pdfRef: React.RefObject<HTMLDivElement> };
}
