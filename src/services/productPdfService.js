import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { getProductDetails } from '../utils/productDetails.js';
import { getProductUrl } from './shareService.js';

export async function generateProductPdf(product) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const margin = 20;
    const usableW = W - margin * 2;
    let y = margin;

    const details = getProductDetails(product.name);
    const url     = getProductUrl(product.id);

    doc.setFillColor(24, 96, 191);
    doc.rect(0, 0, W, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('InsureTechGuard', margin, 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Insurance & Investment Products', margin, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PRODUCT FACT SHEET', W - margin, 13, { align: 'right' });

    y = 36;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    const nameLines = doc.splitTextToSize(product.name, usableW);
    nameLines.forEach((line) => { doc.text(line, margin, y); y += 8; });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 96, 191);
    doc.text(`R${Number(product.price).toFixed(2)} / month`, margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);

    if (product.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(product.description, usableW);
        descLines.forEach((line) => { doc.text(line, margin, y); y += 5.5; });
        doc.setTextColor(0, 0, 0);
        y += 4;
    }

    function section(title, items) {
        doc.setDrawColor(24, 96, 191);
        doc.setLineWidth(0.5);
        doc.line(margin, y, W - margin, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        items.forEach((item) => {
            const lines = doc.splitTextToSize(item, usableW - 6);
            doc.setFillColor(24, 96, 191);
            doc.circle(margin + 1.5, y - 1.4, 0.8, 'F');
            lines.forEach((line, i) => {
                doc.text(line, margin + 6, y);
                if (i < lines.length - 1) y += 5;
            });
            y += 6;
        });
        y += 2;
    }

    section('Benefits', details.benefits);
    section('Requirements', details.requirements);

    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
    const qrSize = 32;
    const qrX = W - margin - qrSize;
    const qrY = H - margin - qrSize - 6;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, qrY - 6, W - margin, qrY - 6);

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('View & subscribe online', margin, qrY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Scan the QR code or visit:', margin, qrY + 12);
    doc.setTextColor(24, 96, 191);
    doc.text(url, margin, qrY + 17);
    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('InsureTechGuard | FSP Licence No. 12345 | Regulated by the FSCA', W / 2, H - 8, { align: 'center' });

    return doc;
}

export async function downloadProductPdf(product) {
    const doc = await generateProductPdf(product);
    doc.save(`${product.name.replace(/\s+/g, '-')}-fact-sheet.pdf`);
}
