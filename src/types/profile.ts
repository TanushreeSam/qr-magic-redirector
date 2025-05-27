
export interface ProfileOption {
  id: string;
  type: 'website' | 'email' | 'phone' | 'whatsapp' | 'brochure';
  label: string;
  value: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  qrId: string;
}
