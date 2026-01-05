// Enum untuk role pengguna
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user', // Penandatangan
}

// Enum untuk status surat
export enum LetterStatus {
  DRAFT = 'draft',
  SIGNED = 'signed',
  INVALID = 'invalid',
}

// Interface untuk User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  secretKeyHash: string; // Hash dari secret key
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Interface untuk Surat/Letter
export interface Letter {
  id: string;
  letterNumber: string; // Nomor surat
  letterDate: Date; // Tanggal surat
  subject: string; // Hal
  attachment: string; // Lampiran
  content?: string; // Isi surat (opsional)
  status: LetterStatus;
  contentHash?: string; // Hash konten surat setelah ditandatangani
  qrCodeUrl?: string; // URL QR Code untuk verifikasi
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk Tanda Tangan/Signature
export interface Signature {
  id: string;
  letterId: string;
  signerId: string;
  signerName: string;
  signedAt: Date;
  contentHash: string; // Hash konten pada saat penandatanganan
  metadata: SignatureMetadata;
}

export interface SignatureMetadata {
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Interface untuk Kegiatan/Event
export interface Event {
  id: string;
  name: string;
  date: Date;
  claimDeadline: Date;
  templateUrl?: string; // URL gambar background sertifikat
  templateConfig: {
    nameX: number;
    nameY: number;
    nameFontSize: number;
    qrX: number;
    qrY: number;
    qrSize: number;
  };
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk Klaim Sertifikat
export interface CertificateClaim {
  id: string;
  eventId: string;
  userId?: string; // Opsional jika klaim publik
  recipientName: string;
  certificateNumber: string;
  qrCodeUrl: string;
  claimedAt: Date;
}

// Interface untuk Log Aktivitas
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

export enum ActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGN_LETTER = 'sign_letter',
  CREATE_LETTER = 'create_letter',
  UPDATE_LETTER = 'update_letter',
  DELETE_LETTER = 'delete_letter',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  RESET_SECRET_KEY = 'reset_secret_key',
  GENERATE_SECRET_KEY = 'generate_secret_key',
  FAILED_SECRET_KEY_ATTEMPT = 'failed_secret_key_attempt',
  CREATE_EVENT = 'create_event',
  UPDATE_EVENT = 'update_event',
  DELETE_EVENT = 'delete_event',
  CLAIM_CERTIFICATE = 'claim_certificate',
}

// Interface untuk verifikasi publik
export interface VerificationResult {
  isValid: boolean;
  letterNumber?: string;
  letterDate?: Date;
  subject?: string;
  attachment?: string;
  signerName?: string;
  signedAt?: Date;
  errorMessage?: string;
  // For certificate verification
  eventName?: string;
  eventDate?: Date;
  recipientName?: string;
}

// Interface untuk rate limiting
export interface RateLimitEntry {
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

export interface LetterFormData {
  letterNumber: string;
  letterDate: string;
  subject: string;
  attachment: string;
  content?: string;
}

export interface EventFormData {
  name: string;
  date: string;
  claimDeadline: string;
  templateUrl: string;
  nameX: number;
  nameY: number;
  nameFontSize: number;
  qrX: number;
  qrY: number;
  qrSize: number;
}

export interface SigningFormData {
  // secretKey removed/optional as per request
}
