import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Type inline para evitar import circular
interface InvoiceData {
  invoiceNumber?: string;
  patientName?: string;
  patientId?: string;
  date?: string;
  dueDate?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  items: Array<{ description?: string; quantity?: number; unitPrice?: number; total?: number }>;
  payments?: Array<{ paymentDate?: string; paymentMethod?: string; amount?: number }>;
}

interface InvoicePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
}

const toString = (val: any): string => String(val ?? '');
const toNumber = (val: any): number => Number(val ?? 0);

/**
 * Genera un PDF con contenido HTML completo de una factura
 */
export async function generateInvoicePdfFromData(
  invoice: InvoiceData,
  options?: InvoicePdfOptions
): Promise<void> {
  const { fileName = `${invoice.invoiceNumber}.pdf` } = options || {};

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let yPosition = margin;

  // Colores RGB
  const primaryColor = [0, 102, 204];
  const darkColor = [51, 51, 51];
  const lightGray = [240, 240, 240];

  // Encabezado
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined as any, 'bold');
  doc.text('FACTURA' as any, margin, yPosition + 15);

  doc.setFontSize(14);
  doc.setFont(undefined as any, 'normal');
  doc.text(toString(invoice.invoiceNumber) as any, pageWidth - margin - 50, yPosition + 15);

  yPosition = 40;

  // Info general
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(10);

  doc.setFont(undefined as any, 'bold');
  doc.text('INFORMACIÓN GENERAL' as any, margin, yPosition);
  yPosition += 8;

  doc.setFont(undefined as any, 'normal');
  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES') : '';
  doc.text(`Fecha: ${dateStr}` as any, margin, yPosition);
  yPosition += 6;
  const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : '';
  doc.text(`Vencimiento: ${dueDateStr}` as any, margin, yPosition);
  yPosition += 6;
  doc.text(`Estado: ${toString(invoice.status)}` as any, margin, yPosition);
  yPosition += 10;

  // Información del paciente
  doc.setFont(undefined as any, 'bold');
  doc.text('PACIENTE' as any, margin, yPosition);
  yPosition += 8;

  doc.setFont(undefined as any, 'normal');
  doc.text(`Nombre: ${toString(invoice.patientName)}` as any, margin, yPosition);
  yPosition += 6;
  doc.text(`ID: ${toString(invoice.patientId)}` as any, margin, yPosition);
  yPosition += 10;

  // Tabla de ítems
  doc.setFont(undefined as any, 'bold');
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.text('DESCRIPCIÓN' as any, margin + 2, yPosition + 6);
  doc.text('CANTIDAD' as any, pageWidth - margin - 45, yPosition + 6);
  doc.text('PRECIO UNITARIO' as any, pageWidth - margin - 30, yPosition + 6);
  doc.text('TOTAL' as any, pageWidth - margin - 10, yPosition + 6);

  yPosition += 10;

  doc.setFont(undefined as any, 'normal');
  doc.setFontSize(9);

  invoice.items.forEach((item) => {
    doc.text(toString(item.description) as any, margin + 2, yPosition);
    doc.text(toString(item.quantity) as any, pageWidth - margin - 45, yPosition);
    doc.text(`$${toNumber(item.unitPrice).toFixed(2)}` as any, pageWidth - margin - 30, yPosition);
    doc.text(`$${toNumber(item.total).toFixed(2)}` as any, pageWidth - margin - 10, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Resumen de montos
  doc.setFont(undefined as any, 'bold');
  doc.setFontSize(10);

  const summaryX = pageWidth - margin - 50;
  doc.text('TOTAL:' as any, summaryX, yPosition);
  doc.setFont(undefined as any, 'normal');
  doc.text(`$${toNumber(invoice.totalAmount).toFixed(2)}` as any, summaryX + 25, yPosition);
  yPosition += 6;

  doc.setFont(undefined as any, 'bold');
  doc.text('PAGADO:' as any, summaryX, yPosition);
  doc.setFont(undefined as any, 'normal');
  doc.text(`$${toNumber(invoice.paidAmount).toFixed(2)}` as any, summaryX + 25, yPosition);
  yPosition += 6;

  doc.setFont(undefined as any, 'bold');
  doc.text('RESTANTE:' as any, summaryX, yPosition);
  doc.setFont(undefined as any, 'normal');
  doc.text(`$${toNumber(invoice.remainingAmount).toFixed(2)}` as any, summaryX + 25, yPosition);
  yPosition += 8;

  // Historial de pagos
  if (invoice.payments && invoice.payments.length > 0) {
    doc.setFont(undefined as any, 'bold');
    doc.setFontSize(10);
    doc.text('HISTORIAL DE PAGOS' as any, margin, yPosition);
    yPosition += 8;

    doc.setFont(undefined as any, 'normal');
    doc.setFontSize(8);

    invoice.payments.forEach((payment) => {
      const paymentDate = new Date(payment.paymentDate ?? '').toLocaleDateString('es-ES');
      const text = `${paymentDate} - ${toString(payment.paymentMethod)}: $${toNumber(payment.amount).toFixed(2)}`;
      doc.text(text as any, margin + 2, yPosition);
      yPosition += 5;
    });
  }

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`OdontoSuite - Generado el ${new Date().toLocaleDateString('es-ES')}` as any, margin, pageHeight - 10);
  doc.text('Documento generado automáticamente - No requiere firma digital' as any, margin, pageHeight - 5);

  // Descargar
  doc.save(fileName);
}

// Export alternativa para compatibilidad
export async function generateInvoicePdf(
  invoice: any,
  htmlElement: HTMLElement,
  options?: InvoicePdfOptions
): Promise<void> {
  const { fileName = `${invoice.invoiceNumber}.pdf` } = options || {};

  try {
    const canvas = await html2canvas(htmlElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210 - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('No se pudo generar el PDF de la factura. Intenta de nuevo.');
  }
}
