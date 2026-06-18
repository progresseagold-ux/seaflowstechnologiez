import { jsPDF } from 'jspdf';

// Utility helper to format numbers as Nigerian Naira currency
const formatNaira = (amount: number): string => {
  return `NGN ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generates a polished, professional PDF document for Solar Component-Based Quotes
 */
export const downloadSolarQuotePdf = (
  clientName: string,
  compSelections: Record<string, { label: string; checked: boolean; type: string; qty: number; options: string[] }>,
  prices: Record<string, number>,
  totalCost: number
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette Constants
  const deepBlue = [10, 35, 66]; // #0A2342
  const accentGold = [253, 184, 19]; // #FDB813
  const charcoal = [30, 41, 59]; // #1E293B
  const textGray = [100, 116, 139]; // #64748B
  const borderLight = [226, 232, 240]; // #E2E8F0

  // Standard Margins
  const marginX = 15;
  let currentY = 15;

  // 1. HEADER BRANDING BLOCK
  doc.setFillColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Mini-accent gold bar beneath deep blue header
  doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.rect(0, 38, 210, 3, 'F');

  // Title Logo Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SEAFLOWS TECHNOLOGIES LTD', marginX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(230, 230, 240);
  doc.text('Premium Clean Energy & Security System Integration', marginX, 22);
  doc.text('Lekki Phase 1, Lagos, Nigeria  |  Support: +234 916 898 5436  |  www.seaflows.com', marginX, 27);

  // Quote Metadata
  const dateStr = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  const referenceId = `SFT-SLR-${Math.floor(100000 + Math.random() * 900000)}`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.text('OFFICIAL ESTIMATE', 155, 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 250);
  doc.setFontSize(8);
  doc.text(`Ref: ${referenceId}`, 155, 22);
  doc.text(`Date: ${dateStr}`, 155, 27);

  // Offset under header
  currentY = 52;

  // 2. CLIENT SEGMENT BLOCK
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PREPARED FOR:', marginX, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text(clientName || 'Valued Customer', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Target Site: Client Custom Specified Installation Site', marginX, currentY + 4);
  doc.text('System Type: Tailored Solar Power Microgrid', marginX, currentY + 8);

  currentY += 16;

  // 3. EQUIPMENT MATRIX INTRO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('ITEMIZED BILL OF COMPONENTS & MATERIALS', marginX, currentY);

  currentY += 6;

  // TABLE HEADER
  doc.setFillColor(248, 250, 252); // light slate
  doc.rect(marginX, currentY, 180, 8, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(marginX, currentY, 180, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text('#', marginX + 3, currentY + 5.5);
  doc.text('Component Details', marginX + 12, currentY + 5.5);
  doc.text('Selected Model Option / Capacity', marginX + 68, currentY + 5.5);
  doc.text('Qty', marginX + 125, currentY + 5.5, { align: 'center' });
  doc.text('Unit Cost (NGN)', marginX + 148, currentY + 5.5, { align: 'right' });
  doc.text('Subtotal (NGN)', marginX + 177, currentY + 5.5, { align: 'right' });

  // Render Table Rows
  currentY += 8;
  let counter = 1;

  Object.entries(compSelections)
    .filter(([_, item]) => item.checked && item.qty > 0)
    .forEach(([_, item]) => {
      // Prevent overflow onto a new page (standard page breaks check)
      if (currentY > 215) {
        doc.addPage();
        currentY = 20;

        // Draw smaller header on second page
        doc.setFillColor(deepBlue[0], deepBlue[1], deepBlue[2]);
        doc.rect(marginX, currentY, 180, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`Equipment Quotation Continued... (Ref: ${referenceId})`, marginX + 4, currentY + 6);
        currentY += 14;
      }

      // Alternate row backgrounds (Zebra)
      if (counter % 2 === 0) {
        doc.setFillColor(252, 254, 255);
        doc.rect(marginX, currentY, 180, 9, 'F');
      }
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.line(marginX, currentY + 9, marginX + 180, currentY + 9);

      // Data placements
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
      
      doc.text(counter.toString(), marginX + 3, currentY + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, marginX + 12, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text(item.type, marginX + 68, currentY + 6, { maxWidth: 50 });

      doc.setFontSize(8);
      doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
      doc.text(item.qty.toString(), marginX + 125, currentY + 6, { align: 'center' });

      const unitPrice = prices[item.type] || 0;
      const subtotal = unitPrice * item.qty;

      doc.setFont('helvetica', 'normal');
      doc.text(unitPrice.toLocaleString(), marginX + 148, currentY + 6, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(subtotal.toLocaleString(), marginX + 177, currentY + 6, { align: 'right' });

      currentY += 9;
      counter++;
    });

  // Space before totals
  currentY += 6;

  // 4. PRICING SUMMARY STRUCTURE (Outright vs Installments)
  if (currentY > 205) {
    doc.addPage();
    currentY = 20;
  }

  // Split into left Terms conditions column, right Totals display column
  const startTotalsY = currentY;

  // Draw background frame for totals
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX + 95, currentY, 85, 45, 'F');
  doc.setDrawColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.rect(marginX + 95, currentY, 85, 45, 'S');

  // Plan B: Cash Outright Option
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PLAN B: OUTRIGHT CASH PRICE (100% upfront)', marginX + 99, currentY + 6);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Green
  doc.text(formatNaira(totalCost), marginX + 175, currentY + 12, { align: 'right' });

  // Divider inside summary block
  doc.setDrawColor(218, 224, 230);
  doc.line(marginX + 98, currentY + 15, marginX + 177, currentY + 15);

  // Plan A: Installments
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PLAN A: FLEXIBLE INSTALMENTS SCHEME', marginX + 99, currentY + 21);

  const downpayment = Math.round(totalCost * 0.3);
  const monthlyPay = Math.round((totalCost * 0.7 * 1.48) / 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  
  doc.text('Initial Down Payment (30% Upfront):', marginX + 99, currentY + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text(formatNaira(downpayment), marginX + 175, currentY + 27, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text('Monthly Payment Repayments (12 months):', marginX + 99, currentY + 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.text(`${formatNaira(monthlyPay)} / mo`, marginX + 175, currentY + 33, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('* Financing incorporates a standardized 48% interest surcharge.', marginX + 99, currentY + 39);

  // Left terms block
  currentY = startTotalsY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('GUARANTEES & SYSTEM WARRANTY:', marginX, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  
  // Bullet items
  const terms = [
    '• Lithium-based battery packages maintain a 5-Year active manufacturer warranty.',
    '• High wattage panels possess a 10-Year structural efficiency warranty.',
    '• Turnkey installation process covers physical deployment, testing, & SLA commissioning.',
    '• Inverters and structural rack units cover a 1-Year replacement indemnity.',
    '• This quote is fully customized and valid for immediate processing within 14 days.'
  ];

  terms.forEach((t, idx) => {
    doc.text(t, marginX, currentY + 11 + (idx * 5), { maxWidth: 85 });
  });

  // Set position past totals container
  currentY = startTotalsY + 55;

  // Footer stamp and signoff
  if (currentY > 265) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, currentY, marginX + 180, currentY);

  currentY += 6;

  // Signatures or branding footnote
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Prepared Dynamically by Seaflows Technologies Quotation Engine. This is a computer-generated commercial offer.', marginX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('Seaflows Technologies Ltd Approvals', 145, currentY, { align: 'right' });

  // Save document
  doc.save(`Seaflows_SolarQuote_${clientName.replace(/\s+/g, '_') || 'Estimate'}.pdf`);
};

/**
 * Generates a polished, professional PDF document for CCTV Surveillance Quotes
 */
export const downloadCctvQuotePdf = (cctvResult: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const deepBlue = [10, 35, 66];
  const accentGold = [253, 184, 19];
  const charcoal = [30, 41, 59];
  const textGray = [100, 116, 139];
  const borderLight = [226, 232, 240];

  const marginX = 15;
  let currentY = 15;

  // 1. HEADER BRANDING BLOCK
  doc.setFillColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.rect(0, 38, 210, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SEAFLOWS TECHNOLOGIES LTD', marginX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(230, 230, 240);
  doc.text('Enterprise Surveillance Systems & High Resolution CCTV Integration', marginX, 22);
  doc.text('Lekki Phase 1, Lagos, Nigeria  |  Support: +234 916 898 5436  |  www.seaflows.com', marginX, 27);

  const dateStr = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  const referenceId = `SFT-CTV-${Math.floor(100000 + Math.random() * 900000)}`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.text('CCTV SECURITY OFFER', 150, 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 250);
  doc.setFontSize(8);
  doc.text(`Ref: ${referenceId}`, 150, 22);
  doc.text(`Date: ${dateStr}`, 150, 27);

  currentY = 52;

  // 2. CLIENT SEGMENT BLOCK
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PREPARED FOR:', marginX, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text('Corporate Security Site File', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Target Layout: ${cctvResult.buildingType.toUpperCase()} architecture structure`, marginX, currentY + 4);
  doc.text(`Total Surveillance Units: ${cctvResult.cameras} Cameras Array  |  Lens: ${cctvResult.cameraType}`, marginX, currentY + 8);

  currentY += 16;

  // 3. STORAGE SEGMENT
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, 180, 15, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(marginX, currentY, 180, 15, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('Surveillance Recording & Network Bandwidth Assessment', marginX + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text(`Equipped with high-performance ${cctvResult.hddSize} storage matrix to support fully-continuous ${cctvResult.storageDays}-Day recording frame feeds using H.265+ smart stream video encoders and network surveillance parameters.`, marginX + 4, currentY + 10, { maxWidth: 172 });

  currentY += 22;

  // 4. BILL OF SECURITY MATERIALS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('REQUIRED SURVEILLANCE EQUIPMENT & ACCESSORIES', marginX, currentY);

  currentY += 6;

  // TABLE HEADER
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, 180, 8, 'F');
  doc.rect(marginX, currentY, 180, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text('Item No.', marginX + 3, currentY + 5.5);
  doc.text('Detailed Description of Surveillance Hardware', marginX + 20, currentY + 5.5);
  doc.text('Required Quantity', marginX + 130, currentY + 5.5);
  doc.text('SLA Status', marginX + 160, currentY + 5.5);

  currentY += 8;
  let itemCounter = 1;

  cctvResult.equipment.forEach((item: { name: string, qty: number }) => {
    if (thisRowOverflows(currentY)) {
      doc.addPage();
      currentY = 20;

      doc.setFillColor(deepBlue[0], deepBlue[1], deepBlue[2]);
      doc.rect(marginX, currentY, 180, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`Surveillance Materials Check continued... (Ref: ${referenceId})`, marginX + 4, currentY + 6.5);
      currentY += 14;
    }

    if (itemCounter % 2 === 0) {
      doc.setFillColor(252, 254, 255);
      doc.rect(marginX, currentY, 180, 9, 'F');
    }
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(marginX, currentY + 9, marginX + 180, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.text(itemCounter.toString(), marginX + 3, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(item.name, marginX + 20, currentY + 6, { maxWidth: 105 });

    doc.setFont('helvetica', 'normal');
    doc.text(`${item.qty} Pcs`, marginX + 130, currentY + 6);
    doc.text('Fully Commissioned', marginX + 160, currentY + 6);

    currentY += 9;
    itemCounter++;
  });

  // Prevent overflow for Totals
  currentY += 6;
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // Totals Panel Frame
  const startTotalsY = currentY;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX + 95, currentY, 85, 45, 'F');
  doc.setDrawColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.rect(marginX + 95, currentY, 85, 45, 'S');

  // Plan B outright
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PLAN B: OUTRIGHT CASH PRICE (System Total)', marginX + 99, currentY + 6);

  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105);
  doc.text(formatNaira(cctvResult.price), marginX + 175, currentY + 12, { align: 'right' });

  doc.setDrawColor(218, 224, 230);
  doc.line(marginX + 98, currentY + 15, marginX + 177, currentY + 15);

  // Plan A installments
  const instDownpayment = Math.round(cctvResult.price * 0.3);
  const instMonthly = Math.round((cctvResult.price * 0.7 * 1.48) / 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('PLAN A: FLEXIBLE INSTALMENTS SCHEME', marginX + 99, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  doc.text('Initial Down Payment (30% Support):', marginX + 99, currentY + 27);
  doc.setFont('helvetica', 'bold');
  doc.text(formatNaira(instDownpayment), marginX + 175, currentY + 27, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Repayment (12 months):', marginX + 99, currentY + 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.text(`${formatNaira(instMonthly)} / mo`, marginX + 175, currentY + 33, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('* Financing incorporates standard 1.48x balance indexing.', marginX + 99, currentY + 39);

  // Left terms
  currentY = startTotalsY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('SURVEILLANCE WORK TERMS:', marginX, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
  
  const cctvTerms = [
    '• 1-Year comprehensive warrantee on DVR/NVR servers & CCTV camera optical sensors.',
    '• Turnkey physical system setup, neat conduit wiring, and socket termination included.',
    '• Mobile Remote Viewing is synchronized over a local WAN / Router configuration.',
    '• Scheduled quarterly checkup maintenance, camera lenses alignment & server testing SLA.',
    `• Instant Turnaround Lead Time: ${cctvResult.leadTime || 'Immediate dispatch.'}`
  ];

  cctvTerms.forEach((item, idx) => {
    doc.text(item, marginX, currentY + 11 + (idx * 5.2), { maxWidth: 85 });
  });

  currentY = startTotalsY + 55;
  if (currentY > 265) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, currentY, marginX + 180, currentY);

  currentY += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Prepared Dynamically by Seaflows Security Quotation Engine. This is a computer-generated commercial offer.', marginX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
  doc.text('Seaflows Technologies Ltd Approvals', 145, currentY, { align: 'right' });

  doc.save(`Seaflows_SecurityCctvQuote_${cctvResult.cameras}_Cameras.pdf`);
};

// Simple row verification helper
function thisRowOverflows(currentYPosition: number): boolean {
  return currentYPosition > 215;
}
