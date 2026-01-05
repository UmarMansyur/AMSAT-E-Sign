import QRCode from 'qrcode';

/**
 * Generate URL verifikasi publik untuk surat
 */
export function generateVerificationUrl(letterId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${base}/verify/${letterId}`;
}

/**
 * Generate QR Code sebagai Data URL
 */
export async function generateQRCodeDataUrl(
  letterId: string,
  baseUrl?: string
): Promise<string> {
  const verificationUrl = generateVerificationUrl(letterId, baseUrl);

  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw new Error('Gagal membuat QR Code');
  }
}

/**
 * Generate QR Code sebagai SVG string
 */
export async function generateQRCodeSvg(
  letterId: string,
  baseUrl?: string
): Promise<string> {
  const verificationUrl = generateVerificationUrl(letterId, baseUrl);

  try {
    const qrSvg = await QRCode.toString(verificationUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    return qrSvg;
  } catch (error) {
    console.error('Error generating QR Code SVG:', error);
    throw new Error('Gagal membuat QR Code SVG');
  }
}

