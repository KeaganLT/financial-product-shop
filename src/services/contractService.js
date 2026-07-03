import { jsPDF } from 'jspdf';

// ─── Contract text generators keyed by product type ───────────────────────────

function detectProductType(productName = '') {
    const n = productName.toLowerCase();
    if (n.includes('device') || n.includes('contract')) return 'device';
    if (n.includes('insurance'))                          return 'insurance';
    if (n.includes('islamic'))                            return 'islamic';
    if (n.includes('vip'))                                return 'vip';
    if (n.includes('investment') || n.includes('annuity') || n.includes('fund')) return 'investment';
    return 'generic';
}

function getContractClauses(type, productName, price) {
    const monthly = `R${Number(price).toFixed(2)}`;
    const annual  = `R${(Number(price) * 12).toFixed(2)}`;

    const shared = [
        {
            heading: '1. Definitions',
            body: '"Policyholder" means the person named in this agreement. "FinShop" means FinShop (Pty) Ltd (FSP Licence No. 12345). "Premium" means the monthly amount payable as specified herein. "Commencement Date" means the date on which this agreement is accepted and activated.',
        },
        {
            heading: '6. Governing Law',
            body: 'This agreement is governed by the laws of the Republic of South Africa. Any dispute arising from or in connection with this agreement shall be subject to the jurisdiction of the South African courts.',
        },
        {
            heading: '7. Regulatory Compliance',
            body: 'FinShop (Pty) Ltd is an authorised Financial Services Provider (FSP Licence No. 12345) regulated by the Financial Sector Conduct Authority (FSCA) under the Financial Advisory and Intermediary Services (FAIS) Act, 37 of 2002.',
        },
        {
            heading: '8. Privacy Notice',
            body: 'Your personal information is processed in accordance with the Protection of Personal Information Act (POPIA), Act 4 of 2013. FinShop will not sell or share your personal information with third parties without your consent, except as required by law or to fulfil this agreement.',
        },
        {
            heading: '9. Cooling-Off Period',
            body: 'You have a right to cancel this agreement within 31 days of the Commencement Date without penalty, provided no claim has been made or benefit taken. Notice of cancellation must be submitted in writing to FinShop.',
        },
        {
            heading: '10. Dispute Resolution',
            body: 'In the event of a dispute, the Policyholder may approach the FSCA, the Ombud for Financial Services Providers, or the relevant Ombudsman office. Contact details are available at www.fsca.co.za.',
        },
    ];

    if (type === 'insurance') return [
        {
            heading: '2. Cover Description',
            body: `This ${productName} provides cover for insured events as described in the product schedule. Cover includes accidental damage, theft, loss, and applicable liability as defined by the product terms. Cover is effective from the Commencement Date, subject to any applicable waiting periods.`,
        },
        {
            heading: '3. Premium & Payment',
            body: `The Policyholder agrees to pay a monthly premium of ${monthly} (annual equivalent: ${annual}) via debit order on the agreed debit date. Failure to pay the premium within the grace period of 15 days may result in suspension or cancellation of cover.`,
        },
        {
            heading: '4. Exclusions',
            body: 'This policy does not cover: (a) intentional acts or wilful misconduct; (b) loss or damage arising from war, invasion, or civil unrest; (c) pre-existing conditions declared before inception; (d) cosmetic damage that does not affect the function of the insured item; (e) claims submitted after 30 days from the date of loss.',
        },
        {
            heading: '5. Claims Process',
            body: 'To lodge a claim, the Policyholder must: (1) notify FinShop within 30 days of the insured event; (2) submit a completed claim form with supporting documentation; (3) provide a copy of a police report where applicable. Claims are assessed within 10 business days of receipt of all required documentation.',
        },
        ...shared,
    ];

    if (type === 'device') return [
        {
            heading: '2. Device & Contract Details',
            body: `This contract covers the supply, financing, and/or maintenance of the device or service described under the product "${productName}". The device remains the property of FinShop until all amounts owing are settled in full.`,
        },
        {
            heading: '3. Monthly Instalment',
            body: `The Policyholder agrees to pay a monthly instalment of ${monthly} for the duration of the contract period. The total contract value is ${annual} per annum. Early settlement may attract a settlement fee as per the tariff schedule.`,
        },
        {
            heading: '4. Device Care & Responsibility',
            body: 'The Policyholder is responsible for the care and safekeeping of the device. Any damage resulting from misuse, negligence, or unauthorised modification is excluded from warranty and maintenance cover. The Policyholder must report loss or theft to FinShop within 24 hours.',
        },
        {
            heading: '5. Termination',
            body: 'Either party may terminate this agreement on 30 calendar days written notice. Upon termination, any outstanding balance becomes immediately due and payable. The device must be returned in good working condition on or before the termination date.',
        },
        ...shared,
    ];

    if (type === 'islamic') return [
        {
            heading: '2. Sharia Compliance',
            body: `This ${productName} is structured in accordance with Islamic finance principles. The product is certified by the FinShop Sharia Supervisory Board. All returns are derived from permissible (halal) activities, free from interest (riba), excessive uncertainty (gharar), and gambling (maysir).`,
        },
        {
            heading: '3. Investment Structure',
            body: `The Policyholder contributes ${monthly} per month. Funds are placed in a Sharia-compliant investment pool. Returns are shared on a profit-sharing basis as declared by the fund manager quarterly. Capital is not guaranteed, and returns vary with fund performance.`,
        },
        {
            heading: '4. Risk Disclosure',
            body: 'Investment in this product carries risk. The value of your investment may go up or down. Past performance is not a guarantee of future returns. The Policyholder acknowledges that FinShop does not guarantee returns and that participation is on the basis of shared profit and shared risk.',
        },
        {
            heading: '5. Redemption & Withdrawal',
            body: 'Withdrawals may be made on 30 calendar days notice. Early withdrawal may result in a reduced share of declared profits for that quarter. Full redemption instructions must be submitted in writing to FinShop.',
        },
        ...shared,
    ];

    if (type === 'vip') return [
        {
            heading: '2. VIP Investment Terms',
            body: `This ${productName} is an exclusive, high-value investment product available to qualifying Policyholders. The monthly contribution of ${monthly} (annual: ${annual}) is invested in a diversified portfolio of high-yield instruments selected by FinShop's accredited investment managers.`,
        },
        {
            heading: '3. Returns & Reporting',
            body: 'The Policyholder will receive a quarterly investment statement reflecting the value of their portfolio, contributions made, and returns earned. FinShop targets market-linked returns but does not guarantee performance. Returns are net of management fees of 1.5% per annum.',
        },
        {
            heading: '4. Dedicated Relationship Manager',
            body: 'VIP Policyholders are assigned a dedicated relationship manager. All queries, change requests, and redemption instructions must be directed through the assigned manager. A 24-hour priority support line is available.',
        },
        {
            heading: '5. Lock-In & Early Redemption',
            body: 'This product has a recommended minimum investment period of 24 months. Early redemption within 12 months will incur an exit fee of 3% of the redeemed amount. No exit fee applies after 24 months.',
        },
        ...shared,
    ];

    // generic investment / fallback
    return [
        {
            heading: '2. Investment Terms',
            body: `This ${productName} is a financial product offered by FinShop (Pty) Ltd. The Policyholder agrees to contribute ${monthly} per month. Funds are invested in accordance with the stated mandate of the product. Performance is market-linked and not guaranteed.`,
        },
        {
            heading: '3. Fees',
            body: 'An annual management fee of 1% of assets under management applies. All fees are disclosed in the product fact sheet and are deducted before returns are credited to the Policyholder.',
        },
        {
            heading: '4. Risk Disclosure',
            body: 'Investments carry risk. The value of your investment may decrease. Past performance is not indicative of future results. The Policyholder confirms that they have read and understood the product risk profile.',
        },
        {
            heading: '5. Redemption',
            body: 'Redemption instructions must be submitted in writing. Proceeds are paid within 7 business days of receipt of a valid instruction. Partial withdrawals are permitted subject to a minimum remaining balance of R1,000.',
        },
        ...shared,
    ];
}

// ─── Main PDF builder ──────────────────────────────────────────────────────────

export function generateContractPdf({ product, bankDetails, profile, signature, signedAt }) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const margin = 20;
    const usableW = W - margin * 2;
    let y = margin;

    const LINE_H   = 5.5;
    const BODY_SIZE = 9;
    const HEAD_SIZE = 11;

    function checkPage(needed = 10) {
        if (y + needed > H - margin) {
            doc.addPage();
            y = margin;
        }
    }

    function text(str, x, size, opts = {}) {
        doc.setFontSize(size);
        doc.text(str, x, y, opts);
    }

    // ── Header bar ──────────────────────────────────────────────────────────────
    doc.setFillColor(24, 96, 191);
    doc.rect(0, 0, W, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FinShop (Pty) Ltd', margin, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('FSP Licence No. 12345 | Authorised Financial Services Provider', margin, 16);
    // Right: "AGREEMENT"
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT AGREEMENT', W - margin, 10, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIDENTIAL', W - margin, 16, { align: 'right' });

    y = 30;
    doc.setTextColor(0, 0, 0);

    // ── Agreement reference + date ──────────────────────────────────────────────
    const dateStr = signedAt
        ? new Date(signedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    const refNo   = `FS-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Reference: ${refNo}`, margin, y);
    doc.text(`Date: ${dateStr}`, W - margin, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 8;

    // ── Title ───────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(product.name.toUpperCase(), W / 2, y, { align: 'center' });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Product Agreement & Debit Order Mandate', W / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 8;

    // ── Divider ─────────────────────────────────────────────────────────────────
    doc.setDrawColor(24, 96, 191);
    doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);
    y += 7;

    // ── Parties box ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(HEAD_SIZE);
    doc.text('PARTIES TO THIS AGREEMENT', margin, y);
    y += 5;

    doc.setFillColor(245, 248, 255);
    doc.setDrawColor(200, 215, 245);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, usableW, 28, 2, 2, 'FD');
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(BODY_SIZE);
    doc.text('SERVICE PROVIDER:', margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text('FinShop (Pty) Ltd, FSP Licence No. 12345, Sandton, Johannesburg, South Africa', margin + 44, y);
    y += LINE_H;

    const name      = profile?.name ?? profile?.firstName
        ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
        : (profile?.username ?? 'N/A');
    const idNumber  = profile?.idNumber ?? 'N/A';
    const email     = profile?.email ?? profile?.username ?? 'N/A';
    const custType  = profile?.customerType?.name ?? 'N/A';

    doc.setFont('helvetica', 'bold');
    doc.text('POLICYHOLDER:', margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(name, margin + 44, y);
    y += LINE_H;

    doc.setFont('helvetica', 'bold');
    doc.text('ID NUMBER:', margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(idNumber, margin + 44, y);
    y += LINE_H;

    doc.setFont('helvetica', 'bold');
    doc.text('EMAIL:', margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(email, margin + 44, y);

    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER TYPE:', margin + 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(custType, margin + 145, y);
    y += 8;

    // ── Product details box ──────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(HEAD_SIZE);
    doc.text('PRODUCT DETAILS', margin, y);
    y += 5;

    doc.setFillColor(245, 248, 255);
    doc.setDrawColor(200, 215, 245);
    doc.roundedRect(margin, y, usableW, 26, 2, 2, 'FD');
    y += 5;

    const rows = [
        ['PRODUCT NAME:', product.name],
        ['MONTHLY PREMIUM:', `R${Number(product.price).toFixed(2)}`],
        ['DEBIT BANK:', bankDetails?.bankName ?? 'N/A'],
        ['ACCOUNT:', bankDetails ? `${bankDetails.accountType} — ending ••••${bankDetails.last4}` : 'N/A'],
        ['DEBIT DATE:', bankDetails ? `${bankDetails.debitDay}${bankDetails.debitDay === 1 ? 'st' : 'th'} of each month` : 'N/A'],
    ];

    const col2 = margin + 50;
    rows.forEach((row, i) => {
        const rowY = y + i * LINE_H;
        checkPage(LINE_H);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(BODY_SIZE);
        doc.text(row[0], margin + 4, rowY);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], col2, rowY);
    });
    y += rows.length * LINE_H + 5;

    // ── Contract clauses ─────────────────────────────────────────────────────────
    const type    = detectProductType(product.name);
    const clauses = getContractClauses(type, product.name, product.price);

    clauses.forEach((clause) => {
        checkPage(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(HEAD_SIZE);
        doc.text(clause.heading, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_SIZE);
        const lines = doc.splitTextToSize(clause.body, usableW);
        lines.forEach((line) => {
            checkPage(LINE_H);
            doc.text(line, margin, y);
            y += LINE_H;
        });
        y += 3;
    });

    // ── Signature block ──────────────────────────────────────────────────────────
    checkPage(50);
    y += 4;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(HEAD_SIZE);
    doc.text('SIGNATURE & ACCEPTANCE', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    const acceptText = 'By signing below, the Policyholder confirms that they have read, understood, and agree to the terms and conditions of this agreement and the debit order mandate contained herein.';
    const acceptLines = doc.splitTextToSize(acceptText, usableW);
    acceptLines.forEach((line) => { doc.text(line, margin, y); y += LINE_H; });
    y += 5;

    if (signature) {
        // Signed — show signature
        doc.setFillColor(248, 255, 248);
        doc.setDrawColor(163, 233, 184);
        doc.roundedRect(margin, y, usableW, 30, 2, 2, 'FD');
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('DIGITAL SIGNATURE:', margin + 4, y);
        y += 5;

        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(16);
        doc.setTextColor(24, 96, 191);
        doc.text(signature, margin + 4, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Signed electronically on ${dateStr}`, margin + 4, y);
        doc.text(`Reference: ${refNo}`, W - margin - 4, y, { align: 'right' });
        y += 4;

        doc.setTextColor(38, 140, 52);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('✓ DIGITALLY SIGNED', margin + 4, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
    } else {
        // Unsigned — show blank signature lines
        const sigY = y + 20;
        doc.setLineWidth(0.4);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, sigY, margin + 80, sigY);
        doc.line(W - margin - 80, sigY, W - margin, sigY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Policyholder signature', margin, sigY + 4);
        doc.text('Date', W - margin, sigY + 4, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y = sigY + 10;
    }

    // ── Footer on every page ─────────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('FinShop (Pty) Ltd | FSP Licence No. 12345 | Regulated by the FSCA', W / 2, H - 8, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, W - margin, H - 8, { align: 'right' });
        doc.setTextColor(0, 0, 0);
    }

    return doc;
}

export function downloadContract(doc, filename) {
    doc.save(filename);
}

export function getContractBlob(doc) {
    return doc.output('blob');
}
