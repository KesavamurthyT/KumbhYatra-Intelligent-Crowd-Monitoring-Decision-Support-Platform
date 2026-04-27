import QRCode from 'qrcode';

export interface QRPassData {
  id: string;
  userId: string;
  name: string;
  role: string;
  timeslot: string;
  gate: string;
  purpose: string;
  validUntil: number;
  signature: string;
}

export const generateQRPass = async (passData: Omit<QRPassData, 'signature'>): Promise<string> => {
  // In a real app, this would be signed by a backend service
  const signature = btoa(JSON.stringify(passData) + "secret_key");
  
  const signedData: QRPassData = {
    ...passData,
    signature
  };

  try {
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(signedData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#FF9933', // Saffron color
        light: '#FFFFFF'
      }
    });
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
};

export const validateQRPass = (qrData: string): { valid: boolean; data?: QRPassData; error?: string } => {
  try {
    const passData: QRPassData = JSON.parse(qrData);
    
    // Verify signature (in a real app, this would use proper crypto verification)
    const expectedSignature = btoa(JSON.stringify({
      id: passData.id,
      userId: passData.userId,
      name: passData.name,
      role: passData.role,
      timeslot: passData.timeslot,
      gate: passData.gate,
      purpose: passData.purpose,
      validUntil: passData.validUntil
    }) + "secret_key");
    
    if (passData.signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature" };
    }
    
    // Check if pass is still valid
    if (Date.now() > passData.validUntil) {
      return { valid: false, error: "Pass has expired" };
    }
    
    return { valid: true, data: passData };
  } catch (error) {
    return { valid: false, error: "Invalid QR code format" };
  }
};

export const formatTimeslot = (timeslot: string): string => {
  const [start, end] = timeslot.split('-');
  return `${start} - ${end}`;
};