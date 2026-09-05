import { Transaction, InvoiceData } from '../types';

/**
 * Generates and downloads standard TallyPrime XML Accounting Voucher
 * formatted according to Tally XML Schema for Purchase / Sales Vouchers.
 */
export function exportToTallyPrimeXml(transaction: Transaction): void {
  const invoice: InvoiceData = transaction.invoice_data || {
    bill_no: transaction.bill_no,
    invoice_date: transaction.created_at.split('T')[0],
    seller: {
      name: 'Seller Agent',
      business_name: 'AgriHub Super Grains Pvt Ltd',
      gstin: '07AAACA1234A1Z5',
      phone: '+91 98765 43210',
      address: 'Plot 42, APMC Grain Complex, Karnal, Haryana',
    },
    buyer: {
      name: 'Buyer Agent',
      business_name: 'Commercial Enterprise Ltd',
      gstin: '19AAECB7788J1ZR',
      phone: '+91 98300 11223',
      address: '14 Park Street, Kolkata, West Bengal',
    },
    item: {
      product_id: transaction.product_id,
      name: transaction.product_name,
      hsn_code: '1006.30',
      quantity: transaction.quantity,
      unit: 'units',
      unit_price: transaction.unit_price,
      base_amount: transaction.base_amount,
      gst_percent: transaction.gst_percent,
      cgst_percent: transaction.gst_percent / 2,
      cgst_amount: transaction.gst_amount / 2,
      sgst_percent: transaction.gst_percent / 2,
      sgst_amount: transaction.gst_amount / 2,
      transport_charge: transaction.transport_charge,
      total_amount: transaction.total_amount,
    },
    payment: {
      razorpay_payment_id: transaction.razorpay_payment_id,
      payment_status: transaction.payment_status,
      paid_at: transaction.created_at,
    },
    audit_summary: {
      total_rounds: 3,
      base_price: transaction.unit_price * 1.1,
      agreed_price: transaction.unit_price,
      discount_secured: transaction.unit_price * 0.1 * transaction.quantity,
      discount_percent: 10,
      settlement_timestamp: transaction.created_at,
    },
  };

  const isInterState = (invoice.buyer.gstin || '19').slice(0, 2) !== (invoice.seller.gstin || '07').slice(0, 2);
  const formattedDate = (invoice.invoice_date || new Date().toISOString().split('T')[0]).replace(/-/g, '');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(invoice.buyer.business_name)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create" OBJVIEW="Invoice Voucher View">
            <DATE>${formattedDate}</DATE>
            <GUID>AGENTBAZAR-${transaction.id}</GUID>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(transaction.bill_no)}</VOUCHERNUMBER>
            <REFERENCE>${escapeXml(transaction.bill_no)}</REFERENCE>
            <PARTYLEDGERNAME>${escapeXml(invoice.seller.business_name)}</PARTYLEDGERNAME>
            <PARTYNAME>${escapeXml(invoice.seller.business_name)}</PARTYNAME>
            <PARTYGSTIN>${escapeXml(invoice.seller.gstin)}</PARTYGSTIN>
            <PLACEOFSUPPLY>${escapeXml(invoice.buyer.gstin.slice(0, 2))}</PLACEOFSUPPLY>
            <STATENAME>${isInterState ? 'Inter-State Supply' : 'Intra-State Supply'}</STATENAME>
            <NARRATION>Autonomous Multi-Agent Procurement via Agent Bazar. UMN: UAP-AUTO-${transaction.id.slice(-6)}. Razorpay Ref: ${transaction.razorpay_payment_id || 'AUTO_ESCROW'}</NARRATION>
            
            <!-- Supplier Credit Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(invoice.seller.business_name)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${transaction.total_amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Base Purchase Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Purchases @ ${transaction.gst_percent}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${transaction.base_amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            ${isInterState ? `
            <!-- IGST Ledger Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input IGST @ ${transaction.gst_percent}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${transaction.gst_amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : `
            <!-- CGST & SGST Ledger Entries -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input CGST @ ${(transaction.gst_percent / 2).toFixed(1)}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${(transaction.gst_amount / 2).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input SGST @ ${(transaction.gst_percent / 2).toFixed(1)}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${(transaction.gst_amount / 2).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            `}

            <!-- Freight & Transport Ledger Entry -->
            ${transaction.transport_charge > 0 ? `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Freight & Inward Cartage</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${transaction.transport_charge.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : ''}

            <!-- Inventory Line Items -->
            <ALLINVENTORYENTRIES.LIST>
              <STOCKITEMNAME>${escapeXml(transaction.product_name)}</STOCKITEMNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <RATE>${transaction.unit_price.toFixed(2)}/unit</RATE>
              <AMOUNT>-${transaction.base_amount.toFixed(2)}</AMOUNT>
              <ACTUALQTY>${transaction.quantity} units</ACTUALQTY>
              <BILLEDQTY>${transaction.quantity} units</BILLEDQTY>
            </ALLINVENTORYENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  triggerDownload(xmlContent, `TallyPrime_${transaction.bill_no}.xml`, 'application/xml');
}

/**
 * Generates and downloads Zoho Books / Standard ERP CSV format
 */
export function exportToZohoBooksCsv(transactions: Transaction[]): void {
  const headers = [
    'Invoice Number',
    'Invoice Date',
    'Customer Name',
    'Customer GSTIN',
    'Vendor Name',
    'Vendor GSTIN',
    'Item Name',
    'HSN/SAC Code',
    'Quantity',
    'Item Price',
    'Tax %',
    'CGST Amount',
    'SGST Amount',
    'IGST Amount',
    'Freight Charges',
    'Total Amount',
    'Payment Status',
    'Payment Mode',
    'Payment Reference ID',
    'Autonomous Mandate UMN'
  ];

  const rows = transactions.map((t) => {
    const inv = t.invoice_data;
    const isInterState = (inv?.buyer.gstin || '19').slice(0, 2) !== (inv?.seller.gstin || '07').slice(0, 2);
    const cgst = isInterState ? 0 : t.gst_amount / 2;
    const sgst = isInterState ? 0 : t.gst_amount / 2;
    const igst = isInterState ? t.gst_amount : 0;

    return [
      `"${t.bill_no}"`,
      `"${new Date(t.created_at).toISOString().split('T')[0]}"`,
      `"${inv?.buyer.business_name || 'Buyer Enterprise'}"`,
      `"${inv?.buyer.gstin || '19AAECB7788J1ZR'}"`,
      `"${inv?.seller.business_name || 'Seller Enterprise'}"`,
      `"${inv?.seller.gstin || '07AAACA1234A1Z5'}"`,
      `"${t.product_name.replace(/"/g, '""')}"`,
      `"1006.30"`,
      t.quantity,
      t.unit_price,
      `${t.gst_percent}%`,
      cgst.toFixed(2),
      sgst.toFixed(2),
      igst.toFixed(2),
      t.transport_charge.toFixed(2),
      t.total_amount.toFixed(2),
      `"${t.payment_status.toUpperCase()}"`,
      `"${t.invoice_data?.payment?.method || 'Razorpay Escrow'}"`,
      `"${t.razorpay_payment_id || 'AUTO_ESCROW_SETTLED'}"`,
      `"UMN-UAP-${t.id.slice(-6)}"`
    ];
  });

  const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvString, `ZohoBooks_Bills_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
