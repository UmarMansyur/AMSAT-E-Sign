'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Letter, Signature, ActivityLog, LetterStatus, ActivityAction, Event, CertificateClaim, EventFormData } from '@/types';
import { mockUsers, mockLetters, mockSignatures, mockActivityLogs, mockEvents, mockCertificateClaims } from '@/lib/mock-data';
import { generateLetterHash, generateSecretKey, hashSecretKey } from '@/lib/crypto';
import { generateQRCodeDataUrl } from '@/lib/qr-generator';
import { v4 as uuidv4 } from 'uuid';

interface DataState {
  users: User[];
  letters: Letter[];
  signatures: Signature[];
  activityLogs: ActivityLog[];
  events: Event[];
  certificateClaims: CertificateClaim[];

  // User actions
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'secretKeyHash'>) => Promise<{ user: User; secretKey: string }>;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetSecretKey: (userId: string) => Promise<string>;

  // Letter actions
  getLetters: () => Letter[];
  getLetterById: (id: string) => Letter | undefined;
  addLetter: (letter: Omit<Letter, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Letter;
  updateLetter: (id: string, data: Partial<Letter>) => void;
  deleteLetter: (id: string) => void;
  signLetter: (letterId: string, signerId: string, signerName: string) => Promise<Signature>;
  generateQRCode: (letterId: string) => Promise<string>;

  // Signature actions
  getSignatures: () => Signature[];
  getSignatureByLetterId: (letterId: string) => Signature | undefined;

  // Event actions
  getEvents: () => Event[];
  getEventById: (id: string) => Event | undefined;
  addEvent: (eventData: EventFormData, creatorId: string) => Event;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  claimCertificate: (eventId: string, recipientName: string, userId?: string) => Promise<CertificateClaim>;
  getClaimsByEventId: (eventId: string) => CertificateClaim[];

  // Activity log actions
  getActivityLogs: () => ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void;

  // Statistics
  getStats: () => {
    totalLetters: number;
    signedLetters: number;
    draftLetters: number;
    invalidLetters: number;
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    totalClaims: number;
  };
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      letters: mockLetters,
      signatures: mockSignatures,
      activityLogs: mockActivityLogs,
      events: mockEvents,
      certificateClaims: mockCertificateClaims,

      // User actions
      getUsers: () => get().users,

      getUserById: (id: string) => get().users.find((u) => u.id === id),

      addUser: async (userData) => {
        const secretKey = generateSecretKey();
        const secretKeyHash = await hashSecretKey(secretKey);

        const newUser: User = {
          id: `user-${uuidv4()}`,
          ...userData,
          secretKeyHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return { user: newUser, secretKey };
      },

      updateUser: (id: string, data: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...data, updatedAt: new Date() } : u
          ),
        }));
      },

      deleteUser: (id: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      resetSecretKey: async (userId: string) => {
        const secretKey = generateSecretKey();
        const secretKeyHash = await hashSecretKey(secretKey);

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, secretKeyHash, updatedAt: new Date() }
              : u
          ),
        }));

        return secretKey;
      },

      // Letter actions
      getLetters: () => get().letters,

      getLetterById: (id: string) => get().letters.find((l) => l.id === id),

      addLetter: (letterData) => {
        const newLetter: Letter = {
          id: `letter-${uuidv4()}`,
          ...letterData,
          status: LetterStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          letters: [...state.letters, newLetter],
        }));

        return newLetter;
      },

      updateLetter: (id: string, data: Partial<Letter>) => {
        const letter = get().letters.find((l) => l.id === id);
        if (letter?.status === LetterStatus.SIGNED) {
          throw new Error('Surat yang sudah ditandatangani tidak dapat diubah');
        }

        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id ? { ...l, ...data, updatedAt: new Date() } : l
          ),
        }));
      },

      deleteLetter: (id: string) => {
        const letter = get().letters.find((l) => l.id === id);
        if (letter?.status === LetterStatus.SIGNED) {
          throw new Error('Surat yang sudah ditandatangani tidak dapat dihapus');
        }

        set((state) => ({
          letters: state.letters.filter((l) => l.id !== id),
          signatures: state.signatures.filter((s) => s.letterId !== id),
        }));
      },

      signLetter: async (letterId: string, signerId: string, signerName: string) => {
        const letter = get().letters.find((l) => l.id === letterId);
        if (!letter) {
          throw new Error('Surat tidak ditemukan');
        }

        if (letter.status === LetterStatus.SIGNED) {
          throw new Error('Surat sudah ditandatangani');
        }

        // Generate content hash
        const contentHash = generateLetterHash(
          letter.letterNumber,
          letter.letterDate,
          letter.subject,
          letter.attachment,
          letter.content
        );

        // Generate QR Code
        const qrCodeUrl = await generateQRCodeDataUrl(letterId);

        const signedAt = new Date();

        // Create signature
        const signature: Signature = {
          id: `sig-${uuidv4()}`,
          letterId,
          signerId,
          signerName,
          signedAt,
          contentHash,
          metadata: {
            timestamp: signedAt,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
        };

        // Update letter status
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === letterId
              ? {
                ...l,
                status: LetterStatus.SIGNED,
                contentHash,
                qrCodeUrl,
                updatedAt: new Date(),
              }
              : l
          ),
          signatures: [...state.signatures, signature],
        }));

        return signature;
      },

      generateQRCode: async (letterId: string) => {
        const letter = get().letters.find((l) => l.id === letterId);
        if (!letter) {
          throw new Error('Surat tidak ditemukan');
        }

        if (letter.status !== LetterStatus.SIGNED) {
          throw new Error('Surat belum ditandatangani');
        }

        // If QR already exists, return it
        if (letter.qrCodeUrl && letter.qrCodeUrl.startsWith('data:image')) {
          return letter.qrCodeUrl;
        }

        // Generate new QR Code
        const qrCodeUrl = await generateQRCodeDataUrl(letterId);

        // Update letter with QR Code
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === letterId
              ? { ...l, qrCodeUrl, updatedAt: new Date() }
              : l
          ),
        }));

        return qrCodeUrl;
      },

      getSignatures: () => get().signatures,

      getSignatureByLetterId: (letterId: string) =>
        get().signatures.find((s) => s.letterId === letterId),

      // Event actions
      getEvents: () => get().events,

      getEventById: (id: string) => get().events.find(e => e.id === id),

      addEvent: (eventData, creatorId) => {
        const newEvent: Event = {
          id: `event-${uuidv4()}`,
          name: eventData.name,
          date: new Date(eventData.date),
          claimDeadline: new Date(eventData.claimDeadline),
          templateUrl: eventData.templateUrl,
          templateConfig: {
            nameX: eventData.nameX,
            nameY: eventData.nameY,
            nameFontSize: eventData.nameFontSize,
            qrX: eventData.qrX,
            qrY: eventData.qrY,
            qrSize: eventData.qrSize,
          },
          createdById: creatorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          events: [...state.events, newEvent],
        }));

        return newEvent;
      },

      updateEvent: (id, data) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          certificateClaims: state.certificateClaims.filter(c => c.eventId !== id),
        }));
      },

      claimCertificate: async (eventId, recipientName, userId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event) throw new Error('Kegiatan tidak ditemukan');

        if (new Date() > new Date(event.claimDeadline)) {
          throw new Error('Batas waktu klaim sertifikat telah habis');
        }

        const claimId = `cert-${uuidv4()}`;
        // Generate a unique data/URL for the QR
        const qrDataPayload = JSON.stringify({
          type: 'certificate',
          eventId: eventId,
          claimId: claimId,
          recipientName: recipientName,
          valid: true
        });

        // This is a minimal mock QR generation for the certificate specifically
        const qrCodeUrl = await generateQRCodeDataUrl(qrDataPayload);

        const newClaim: CertificateClaim = {
          id: claimId,
          eventId,
          userId,
          recipientName,
          certificateNumber: `CERT/${event.id.substring(0, 4)}/${claimId.substring(0, 4)}`.toUpperCase(),
          qrCodeUrl,
          claimedAt: new Date(),
        };

        set((state) => ({
          certificateClaims: [...state.certificateClaims, newClaim],
        }));

        return newClaim;
      },

      getClaimsByEventId: (eventId) => get().certificateClaims.filter(c => c.eventId === eventId),

      // Activity log actions
      getActivityLogs: () => get().activityLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),

      addActivityLog: (logData) => {
        const newLog: ActivityLog = {
          id: uuidv4(),
          ...logData,
          createdAt: new Date(),
        };

        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },

      // Statistics
      getStats: () => {
        const { letters, users, events, certificateClaims } = get();
        return {
          totalLetters: letters.length,
          signedLetters: letters.filter((l) => l.status === LetterStatus.SIGNED).length,
          draftLetters: letters.filter((l) => l.status === LetterStatus.DRAFT).length,
          invalidLetters: letters.filter((l) => l.status === LetterStatus.INVALID).length,
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
          totalEvents: events.length,
          totalClaims: certificateClaims.length,
        };
      },
    }),
    {
      name: 'data-storage',
    }
  )
);
