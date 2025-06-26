
'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Presupuesto, Paciente } from '@/types';
import logoImage from '@/components/assets/logo.png'; // Import the logo image

export function generateBudgetPDF(presupuesto: Presupuesto, paciente: Paciente) {
  const doc = new jsPDF();

  // --- Header ---
  const logoSrc = logoImage.src;
  doc.addImage(logoSrc, 'PNG', 14, 15, 24, 8); // x, y, width, height

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Centro Dental Especializado Loayza', doc.internal.pageSize.getWidth() - 14, 20, { align: 'right' });
  doc.text('Urb. Bolognesi, MCAL Castilla 1800 - Int. 2do. Piso', doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });
  doc.text('Urb. Bolognesi, Cercado, Tacna', doc.internal.pageSize.getWidth() - 14, 30, { align: 'right' });
  doc.text('Tel: 910352359', doc.internal.pageSize.getWidth() - 14, 35, { align: 'right' });

  // --- Title ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40);
  const title = presupuesto.nombre || 'PRESUPUESTO';
  doc.text(title.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

  // --- Patient & Date Info ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ${paciente.persona.apellidoMaterno}`, 14, 80);
  doc.text(`Impreso el ${format(new Date(), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}`, doc.internal.pageSize.getWidth() - 14, 80, { align: 'right' });

  // --- Main Table ---
  const tableColumn = ["Servicio", "Cant.", "P. Unit.", "Subtotal", "Pagado"];
  const tableRows = presupuesto.items.map(item => [
    item.procedimiento.denominacion,
    item.cantidad,
    `S/ ${item.procedimiento.precioBase.toFixed(2)}`,
    `S/ ${(item.procedimiento.precioBase * item.cantidad).toFixed(2)}`,
    `S/ ${(item.montoPagado || 0).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: 'striped',
    headStyles: {
      fillColor: [224, 242, 254], // Light blue color
      textColor: [23, 78, 122], // Darker blue text
      fontStyle: 'bold',
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Very light gray for alternate rows
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    }
  });

  // --- Footer Totals Table ---
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const totalPresupuesto = presupuesto.items.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  const montoPagado = presupuesto.montoPagado;
  const porPagar = totalPresupuesto - montoPagado;

  const footerRows = [
    ['Pagado', `S/ ${montoPagado.toFixed(2)}`],
    ['Por pagar', `S/ ${porPagar.toFixed(2)}`]
  ];

  autoTable(doc, {
    body: footerRows,
    startY: finalY + 8,
    theme: 'plain',
    tableWidth: 80,
    margin: { left: doc.internal.pageSize.getWidth() - 94 }, // Align to the right
    styles: {
      fontSize: 10,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 5 },
    },
    didDrawCell: (data) => {
      // Custom styling for the "Por pagar" row
      if (data.row.index === 1) {
        doc.setFillColor(45, 55, 72); // Dark background color
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont('helvetica', 'bold');
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.text(String(data.cell.text), data.cell.x + 5, data.cell.y + data.cell.height / 2, {
          baseline: 'middle'
        });
      }
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // --- Save PDF ---
  doc.save(`Presupuesto-${paciente.persona.apellidoPaterno}-${presupuesto.id.slice(-4)}.pdf`);
}
