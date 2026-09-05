import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, Transaction } from '../types';

/**
 * Generates and downloads a clean, vector-sharp, professional GST Tax Invoice PDF
 * compliant with Section 31 of the CGST Act, 2017.
 */
export const downloadInvoicePdf = (invoice: InvoiceData, transaction?: Transaction | null) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const isPaid = invoice.payment.payment_status === 'paid' || transaction?.payment_status === 'paid';
  const paymentId = invoice.payment.razorpay_payment_id || transaction?.razorpay_payment_id || 'PAY_AUTO_SETTLED';
  const paymentMethod = invoice.payment.method || 'Razorpay Autonomous Smart-Escrow';
  const paymentDate = invoice.payment.paid_at || transaction?.created_at || new Date().toISOString();

  // -------------------------------------------------------------
  // 1. TOP BRAND & DOCUMENT HEADER
  // -------------------------------------------------------------
  // Navy Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, contentWidth, 24, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AGENT BAZAR', margin + 6, 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text('AUTONOMOUS B2B COMMERCE & APMC MANDI PROTOCOL', margin + 6, 27);
  doc.text('Issued in accordance with Section 31 of CGST Act, 2017', margin + 6, 31);

  // TAX INVOICE Title (Right aligned)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.cross_border?.is_cross_border ? 'EXPORT TAX INVOICE' : 'TAX INVOICE', pageWidth - margin - 6, 21, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(invoice.cross_border?.is_cross_border ? `Dual-Currency: INR / ${invoice.cross_border.export_currency}` : 'Original for Recipient', pageWidth - margin - 6, 26, { align: 'right' });
  doc.text(`Invoice No: ${invoice.bill_no}`, pageWidth - margin - 6, 31, { align: 'right' });

  // -------------------------------------------------------------
  // 2. INVOICE META & STATUS RIBBON
  // -------------------------------------------------------------
  let currentY = 40;

  // Metadata Strip
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Invoice Date:', margin + 4, currentY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_date, margin + 25, currentY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply:', margin + 55, currentY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.seller.address.split(',').pop()?.trim() || 'India'} (${invoice.seller.gstin.slice(0, 2)})`, margin + 80, currentY + 7.5);

  // Status Badge in Meta Strip
  if (isPaid) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(pageWidth - margin - 52, currentY + 2, 48, 8, 2, 2, 'FD');
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT: VERIFIED & SETTLED', pageWidth - margin - 28, currentY + 7.2, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(pageWidth - margin - 52, currentY + 2, 48, 8, 2, 2, 'FD');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT: PENDING SETTLEMENT', pageWidth - margin - 28, currentY + 7.2, { align: 'center' });
  }

  currentY += 16;

  // -------------------------------------------------------------
  // 3. SELLER & BUYER DETAILS (2-COLUMN GRID)
  // -------------------------------------------------------------
  const colWidth = (contentWidth - 6) / 2;

  // Seller Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, colWidth, 38, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('SUPPLIER / SELLER DETAILS', margin + 4, currentY + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(invoice.seller.business_name || invoice.seller.name, colWidth - 8), margin + 4, currentY + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const sellerAddressLines = doc.splitTextToSize(invoice.seller.address, colWidth - 8);
  doc.text(sellerAddressLines, margin + 4, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`GSTIN: `, margin + 4, currentY + 29);
  doc.setFont('courier', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text(invoice.seller.gstin, margin + 16, currentY + 29);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${invoice.seller.phone}`, margin + 4, currentY + 34);

  // Buyer Box
  const buyerX = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(buyerX, currentY, colWidth, 38, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('BILLED TO / BUYER DETAILS', buyerX + 4, currentY + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(invoice.buyer.business_name || invoice.buyer.name, colWidth - 8), buyerX + 4, currentY + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const buyerAddressLines = doc.splitTextToSize(invoice.buyer.address, colWidth - 8);
  doc.text(buyerAddressLines, buyerX + 4, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`GSTIN: `, buyerX + 4, currentY + 29);
  doc.setFont('courier', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text(invoice.buyer.gstin, buyerX + 16, currentY + 29);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${invoice.buyer.phone}`, buyerX + 4, currentY + 34);

  currentY += 42;

  // -------------------------------------------------------------
  // 4. LINE ITEMS TABLE (autoTable)
  // -------------------------------------------------------------
  const isInterstate = invoice.seller.gstin.slice(0, 2) !== invoice.buyer.gstin.slice(0, 2);
  const taxLabel = isInterstate ? `IGST (${invoice.item.gst_percent}%)` : `GST (${invoice.item.gst_percent}%)`;
  const totalTaxAmount = invoice.item.cgst_amount + invoice.item.sgst_amount;

  const tableBody = [
    [
      '1',
      `${invoice.item.name}\n(Autonomous B2B Cleared Commodity Batch)`,
      invoice.item.hsn_code,
      `${invoice.item.quantity} ${invoice.item.unit}`,
      `Rs. ${invoice.item.unit_price.toFixed(2)}`,
      `Rs. ${invoice.item.base_amount.toFixed(2)}`,
      `Rs. ${totalTaxAmount.toFixed(2)}`,
      `Rs. ${(invoice.item.base_amount + totalTaxAmount).toFixed(2)}`,
    ],
  ];

  if (invoice.item.transport_charge > 0) {
    tableBody.push([
      '2',
      'Commercial Freight & Transport Surcharge',
      '9965',
      '1 Trip',
      `Rs. ${invoice.item.transport_charge.toFixed(2)}`,
      `Rs. ${invoice.item.transport_charge.toFixed(2)}`,
      'Rs. 0.00',
      `Rs. ${invoice.item.transport_charge.toFixed(2)}`,
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Description of Goods', 'HSN', 'Qty', 'Agreed Rate', 'Taxable Val', taxLabel, 'Total Amount']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 54 },
      2: { cellWidth: 16, halign: 'center', font: 'courier' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  currentY = finalTableY + 5;

  // -------------------------------------------------------------
  // 5. TAX BREAKDOWN & PAYMENT STAMP SECTION
  // -------------------------------------------------------------
  const summaryBoxWidth = 80;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const stampBoxWidth = contentWidth - summaryBoxWidth - 6;

  // Payment Verification Seal Stamp (Left)
  doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 243, isPaid ? 244 : 199);
  doc.setDrawColor(isPaid ? 16 : 245, isPaid ? 185 : 158, isPaid ? 129 : 11);
  doc.roundedRect(margin, currentY, stampBoxWidth, 42, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 6 : 146, isPaid ? 95 : 64, isPaid ? 70 : 14);
  doc.text(isPaid ? 'PAYMENT VERIFICATION: AUTHENTICATED & SETTLED' : 'PAYMENT STATUS: ESCROW PENDING', margin + 4, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Payment ID: ${paymentId}`, margin + 4, currentY + 14);
  doc.text(`Method: ${paymentMethod}`, margin + 4, currentY + 20);
  doc.text(`Settled At: ${new Date(paymentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`, margin + 4, currentY + 26);
  doc.text(`Settlement Ref: UAP-AUTONOMOUS-ESCROW-2024-V9`, margin + 4, currentY + 32);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Cryptographically cleared via NPCI Unified Agriculture Protocol & Razorpay Escrow.', margin + 4, currentY + 38);

  // Financial Subtotals Summary (Right)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, 42, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  let rightRowY = currentY + 6;
  doc.text('Taxable Subtotal:', summaryBoxX + 4, rightRowY);
  doc.text(`Rs. ${invoice.item.base_amount.toFixed(2)}`, pageWidth - margin - 4, rightRowY, { align: 'right' });

  if (isInterstate) {
    rightRowY += 5.5;
    doc.text(`Integrated GST (IGST @ ${invoice.item.gst_percent}%):`, summaryBoxX + 4, rightRowY);
    doc.text(`Rs. ${totalTaxAmount.toFixed(2)}`, pageWidth - margin - 4, rightRowY, { align: 'right' });
  } else {
    rightRowY += 5;
    doc.text(`Central GST (CGST @ ${invoice.item.cgst_percent}%):`, summaryBoxX + 4, rightRowY);
    doc.text(`Rs. ${invoice.item.cgst_amount.toFixed(2)}`, pageWidth - margin - 4, rightRowY, { align: 'right' });

    rightRowY += 5;
    doc.text(`State GST (SGST @ ${invoice.item.sgst_percent}%):`, summaryBoxX + 4, rightRowY);
    doc.text(`Rs. ${invoice.item.sgst_amount.toFixed(2)}`, pageWidth - margin - 4, rightRowY, { align: 'right' });
  }

  rightRowY += 5;
  doc.text('Freight / Delivery Surcharge:', summaryBoxX + 4, rightRowY);
  doc.text(`Rs. ${invoice.item.transport_charge.toFixed(2)}`, pageWidth - margin - 4, rightRowY, { align: 'right' });

  // Grand Total Line
  rightRowY += 7;
  doc.setDrawColor(15, 23, 42);
  doc.line(summaryBoxX + 4, rightRowY - 2, pageWidth - margin - 4, rightRowY - 2);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total (INR Base):', summaryBoxX + 4, rightRowY + 3);
  doc.setFontSize(10.5);
  doc.setTextColor(30, 27, 75); // indigo-950
  doc.text(`Rs. ${invoice.item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, rightRowY + 3, { align: 'right' });

  if (invoice.cross_border?.is_cross_border) {
    rightRowY += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text(`Export Equivalent (${invoice.cross_border.export_currency}):`, summaryBoxX + 4, rightRowY + 2);
    doc.setFontSize(9.5);
    doc.text(`${invoice.cross_border.export_currency} ${invoice.cross_border.foreign_total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, rightRowY + 2, { align: 'right' });
  }

  currentY += invoice.cross_border?.is_cross_border ? 53 : 47;

  // -------------------------------------------------------------
  // 5B. CROSS-BORDER CUSTOMS & FX VALUATION STRIP (WHEN CROSS-BORDER)
  // -------------------------------------------------------------
  if (invoice.cross_border?.is_cross_border) {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(153, 246, 228); // teal-200
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(`Cross-Border B2B Export Provision (Incoterm: ${invoice.cross_border.incoterm})`, margin + 4, currentY + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`- FX Reference: 1 ${invoice.cross_border.export_currency} = Rs. ${invoice.cross_border.exchange_rate_to_inr.toFixed(4)} (${invoice.cross_border.fx_provider})`, margin + 4, currentY + 10);
    doc.text(`- Port: ${invoice.cross_border.port_of_loading} -> ${invoice.cross_border.destination_country}`, margin + 75, currentY + 10);
    doc.text(`- IEC: ${invoice.cross_border.iec_number} | LUT: ${invoice.cross_border.lut_arn_number}`, margin + 140, currentY + 10);

    currentY += 17;
  }

  // -------------------------------------------------------------
  // 6. AI NEGOTIATION RECORD & 2-TIER ESCROW SUMMARY
  // -------------------------------------------------------------
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('AI Autonomous Negotiation Audit Summary', margin + 4, currentY + 5.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`- Listed Quote: Rs. ${invoice.audit_summary.base_price}/unit`, margin + 4, currentY + 11);
  doc.text(`- Final Agreed Rate: Rs. ${invoice.audit_summary.agreed_price}/unit`, margin + 4, currentY + 16);

  doc.text(`- Buyer Savings Secured: Rs. ${invoice.audit_summary.discount_secured.toFixed(2)} (${invoice.audit_summary.discount_percent}% Margin)`, margin + 60, currentY + 11);
  doc.text(`- Negotiation Iterations: ${invoice.audit_summary.total_rounds} Multi-Agent Rounds`, margin + 60, currentY + 16);

  doc.text(`- 20% Advance Lock: Rs. ${(invoice.item.total_amount * 0.20).toFixed(2)}`, margin + 130, currentY + 11);
  doc.text(`- 80% Delivery Release: Rs. ${(invoice.item.total_amount * 0.80).toFixed(2)}`, margin + 130, currentY + 16);

  currentY += 24;

  // -------------------------------------------------------------
  // 7. DECLARATION, DIGITAL SIGNATURE & FOOTER
  // -------------------------------------------------------------
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', margin, currentY + 4);
  doc.text('This is a digitally signed computer-generated GST Tax Invoice created via Agent Bazar Autonomous Engine.', margin, currentY + 8);

  // Digital Signatory Stamp Box
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - margin - 50, currentY, 50, 15, 1, 1);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('For ' + (invoice.seller.business_name || 'AgriHub Merchant'), pageWidth - margin - 25, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('[Digitally Signed & Cleared]', pageWidth - margin - 25, currentY + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Authorized Signatory', pageWidth - margin - 25, currentY + 13, { align: 'center' });

  // Save the PDF
  const filename = `GST_Invoice_${invoice.bill_no.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
};
