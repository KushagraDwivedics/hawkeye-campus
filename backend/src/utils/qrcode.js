const QRCode = require('qrcode');
const { v4: uuid } = require('uuid');

const generateQRCode = async (lectureId, sessionToken, expiryTime) => {
  try {
    const qrData = {
      lectureId,
      sessionToken,
      expiryTime,
      generatedAt: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrString);

    return {
      success: true,
      qrCode: qrCodeImage,
      data: qrData
    };
  } catch (error) {
    console.error('QR Code generation error:', error);
    return {
      success: false,
      message: 'Failed to generate QR code'
    };
  }
};

const generateSessionToken = () => {
  return uuid();
};

module.exports = {
  generateQRCode,
  generateSessionToken
};
