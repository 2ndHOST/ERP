const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Generate PDF receipt
const generateReceipt = async (feeData, studentData, blockchainHash) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Student ERP System', 50, 50);
    doc.fontSize(16).text('Fee Payment Receipt', 50, 80);
    doc.moveDown();

    // Receipt details
    doc.fontSize(12);
    doc.text(`Receipt No: ${feeData.id}`, 50, 120);
    doc.text(`Date: ${new Date(feeData.payment_date).toLocaleDateString()}`, 50, 140);
    doc.text(`Student ID: ${studentData.id}`, 50, 160);
    doc.text(`Student Name: ${studentData.name}`, 50, 180);
    doc.text(`Email: ${studentData.email}`, 50, 200);
    doc.text(`Course: ${studentData.course}`, 50, 220);
    doc.moveDown();

    // Payment details
    doc.text('Payment Details:', 50, 260);
    doc.text(`Amount: ₹${feeData.amount}`, 70, 280);
    doc.text(`Status: ${feeData.status.toUpperCase()}`, 70, 300);
    doc.text(`Transaction ID: ${feeData.transaction_id}`, 70, 320);
    doc.moveDown();

    // Blockchain verification
    doc.text('Blockchain Verification:', 50, 360);
    doc.text(`Hash: ${blockchainHash}`, 70, 380);
    doc.text('This receipt is verified on blockchain', 70, 400);
    doc.moveDown();

    // QR Code
    doc.text('Verification QR Code:', 50, 440);
    
    // Generate QR code
    QRCode.toDataURL(`https://verify.erp.com/${blockchainHash}`)
      .then(qrCodeDataURL => {
        doc.image(qrCodeDataURL, 50, 460, { width: 150, height: 150 });
        doc.end();
      })
      .catch(reject);
  });
};

// Generate QR code for verification
const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// Generate verification URL
const generateVerificationURL = (blockchainHash) => {
  return `https://verify.erp.com/${blockchainHash}`;
};

module.exports = {
  generateReceipt,
  generateQRCode,
  generateVerificationURL
};
