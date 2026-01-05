'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Letter, Signature, ActivityLog, LetterStatus, ActivityAction, Event, CertificateClaim, EventFormData } from '@/types';
import { generateLetterHash, generateSecretKey, hashSecretKey } from '@/lib/crypto';
import { generateQRCodeDataUrl } from '@/lib/qr-generator';
import { usersApi, lettersApi, eventsApi, logsApi, signaturesApi, statsApi } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

// Flag to switch between API and local storage
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true';

interface DataState {
  // Local state (used as cache or fallback)
  users: User[];
  letters: Letter[];
  signatures: Signature[];
  activityLogs: ActivityLog[];
  events: Event[];
  certificateClaims: CertificateClaim[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Fetch actions (load data from API)
  fetchUsers: () => Promise<void>;
  fetchLetters: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchStats: () => Promise<any>;

  // User actions
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'secretKeyHash'>) => Promise<{ user: User; secretKey: string }>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetSecretKey: (userId: string) => Promise<string>;

  // Letter actions
  getLetters: () => Letter[];
  getLetterById: (id: string) => Letter | undefined;
  addLetter: (letter: Omit<Letter, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Letter>;
  updateLetter: (id: string, data: Partial<Letter>) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  signLetter: (letterId: string, signerId: string, signerName: string) => Promise<Signature>;
  generateQRCode: (letterId: string) => Promise<string>;

  // Signature actions
  getSignatures: () => Signature[];
  getSignatureByLetterId: (letterId: string) => Signature | undefined;

  // Event actions
  getEvents: () => Event[];
  getEventById: (id: string) => Event | undefined;
  addEvent: (eventData: EventFormData, creatorId: string) => Promise<Event>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  claimCertificate: (eventId: string, recipientName: string, callSign?: string, userId?: string) => Promise<CertificateClaim>;
  getClaimsByEventId: (eventId: string) => CertificateClaim[];

  // Activity log actions
  getActivityLogs: () => ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => Promise<void>;

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
      users: [],
      letters: [],
      signatures: [],
      activityLogs: [],
      events: [],
      certificateClaims: [],
      isLoading: false,
      error: null,

      // ============ FETCH ACTIONS ============
      fetchUsers: async () => {
        if (!USE_API) return;
        set({ isLoading: true, error: null });
        try {
          const users = await usersApi.getAll();
          set({ users: users.map(u => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) })) });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchLetters: async () => {
        if (!USE_API) return;
        set({ isLoading: true, error: null });
        try {
          const letters = await lettersApi.getAll();
          set({
            letters: letters.map(l => ({
              ...l,
              letterDate: new Date(l.letterDate),
              createdAt: new Date(l.createdAt),
              updatedAt: new Date(l.updatedAt)
            })),
            signatures: letters.flatMap((l: any) => l.signatures || []).map((s: any) => ({
              ...s,
              signedAt: new Date(s.signedAt),
            })),
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEvents: async () => {
        if (!USE_API) return;
        set({ isLoading: true, error: null });
        try {
          const events = await eventsApi.getAll();
          set({
            events: events.map(e => ({
              ...e,
              date: new Date(e.date),
              claimDeadline: new Date(e.claimDeadline),
              createdAt: new Date(e.createdAt),
              updatedAt: new Date(e.updatedAt)
            }))
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchLogs: async () => {
        if (!USE_API) return;
        set({ isLoading: true, error: null });
        try {
          const logs = await logsApi.getAll();
          set({
            activityLogs: logs.map(l => ({
              ...l,
              createdAt: new Date(l.createdAt)
            }))
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchStats: async () => {
        if (!USE_API) return get().getStats();
        try {
          return await statsApi.get();
        } catch {
          return get().getStats();
        }
      },

      // ============ USER ACTIONS ============
      getUsers: () => get().users,

      getUserById: (id: string) => get().users.find((u) => u.id === id),

      addUser: async (userData) => {
        const secretKey = generateSecretKey();
        const secretKeyHash = await hashSecretKey(secretKey);

        if (USE_API) {
          try {
            const newUser = await usersApi.create({
              ...userData,
              secretKeyHash,
            });
            set((state) => ({
              users: [...state.users, { ...newUser, createdAt: new Date(newUser.createdAt), updatedAt: new Date(newUser.updatedAt) }],
            }));
            return { user: newUser, secretKey };
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
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

      updateUser: async (id: string, data: Partial<User>) => {
        if (USE_API) {
          try {
            const updatedUser = await usersApi.update(id, data);
            set((state) => ({
              users: state.users.map((u) =>
                u.id === id ? { ...updatedUser, createdAt: new Date(updatedUser.createdAt), updatedAt: new Date(updatedUser.updatedAt) } : u
              ),
            }));
            return;
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...data, updatedAt: new Date() } : u
          ),
        }));
      },

      deleteUser: async (id: string) => {
        if (USE_API) {
          try {
            await usersApi.delete(id);
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      resetSecretKey: async (userId: string) => {
        const secretKey = generateSecretKey();
        const secretKeyHash = await hashSecretKey(secretKey);

        if (USE_API) {
          try {
            await usersApi.update(userId, { secretKeyHash } as any);
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, secretKeyHash, updatedAt: new Date() }
              : u
          ),
        }));

        return secretKey;
      },

      // ============ LETTER ACTIONS ============
      getLetters: () => get().letters,

      getLetterById: (id: string) => get().letters.find((l) => l.id === id),

      addLetter: async (letterData) => {
        if (USE_API) {
          try {
            const newLetter = await lettersApi.create({
              letterNumber: letterData.letterNumber,
              letterDate: letterData.letterDate.toISOString(),
              subject: letterData.subject,
              attachment: letterData.attachment,
              content: letterData.content,
              createdById: letterData.createdById,
            });
            const letter = {
              ...newLetter,
              letterDate: new Date(newLetter.letterDate),
              createdAt: new Date(newLetter.createdAt),
              updatedAt: new Date(newLetter.updatedAt)
            };
            set((state) => ({
              letters: [...state.letters, letter],
            }));
            return letter;
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
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

      updateLetter: async (id: string, data: Partial<Letter>) => {
        const letter = get().letters.find((l) => l.id === id);
        if (letter?.status === LetterStatus.SIGNED) {
          throw new Error('Surat yang sudah ditandatangani tidak dapat diubah');
        }

        if (USE_API) {
          try {
            await lettersApi.update(id, data);
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id ? { ...l, ...data, updatedAt: new Date() } : l
          ),
        }));
      },

      deleteLetter: async (id: string) => {
        const letter = get().letters.find((l) => l.id === id);
        if (letter?.status === LetterStatus.SIGNED) {
          throw new Error('Surat yang sudah ditandatangani tidak dapat dihapus');
        }

        if (USE_API) {
          try {
            await lettersApi.delete(id);
          } catch (error: any) {
            throw new Error(error.message);
          }
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

        if (USE_API) {
          try {
            const signature = await lettersApi.sign(letterId, {
              signerId,
              signerName,
              contentHash,
              qrCodeUrl,
              metadata: {
                timestamp: signedAt,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
              },
            });

            // Refresh letters to get updated status
            await get().fetchLetters();

            return {
              ...signature,
              signedAt: new Date(signature.signedAt),
            };
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
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

      // ============ EVENT ACTIONS ============
      getEvents: () => get().events,

      getEventById: (id: string) => get().events.find(e => e.id === id),

      addEvent: async (eventData, creatorId) => {
        if (USE_API) {
          try {
            const newEvent = await eventsApi.create({
              name: eventData.name,
              date: eventData.date,
              claimDeadline: eventData.claimDeadline,
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
            });
            const event = {
              ...newEvent,
              date: new Date(newEvent.date),
              claimDeadline: new Date(newEvent.claimDeadline),
              createdAt: new Date(newEvent.createdAt),
              updatedAt: new Date(newEvent.updatedAt)
            };
            set((state) => ({
              events: [...state.events, event],
            }));
            return event;
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
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

      updateEvent: async (id, data) => {
        if (USE_API) {
          try {
            await eventsApi.update(id, data);
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteEvent: async (id) => {
        if (USE_API) {
          try {
            await eventsApi.delete(id);
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          certificateClaims: state.certificateClaims.filter(c => c.eventId !== id),
        }));
      },

      claimCertificate: async (eventId, recipientName, callSign, userId) => {
        if (USE_API) {
          try {
            const claim = await eventsApi.claimCertificate(eventId, {
              recipientName,
              callSign,
              userId,
            });
            const newClaim = {
              ...claim,
              claimedAt: new Date(claim.claimedAt),
            };
            set((state) => ({
              certificateClaims: [...state.certificateClaims, newClaim],
            }));
            return newClaim;
          } catch (error: any) {
            throw new Error(error.message);
          }
        }

        // Local fallback
        const event = get().events.find(e => e.id === eventId);
        if (!event) throw new Error('Kegiatan tidak ditemukan');

        if (new Date() > new Date(event.claimDeadline)) {
          throw new Error('Batas waktu klaim sertifikat telah habis');
        }

        const claimId = `cert-${uuidv4()}`;
        const qrDataPayload = JSON.stringify({
          type: 'certificate',
          eventId: eventId,
          claimId: claimId,
          recipientName: recipientName,
          callSign: callSign || undefined,
          valid: true
        });

        const qrCodeUrl = await generateQRCodeDataUrl(qrDataPayload);

        const newClaim: CertificateClaim = {
          id: claimId,
          eventId,
          userId,
          recipientName,
          callSign,
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

      // ============ ACTIVITY LOG ACTIONS ============
      getActivityLogs: () => get().activityLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),

      addActivityLog: async (logData) => {
        const newLog: ActivityLog = {
          id: uuidv4(),
          ...logData,
          createdAt: new Date(),
        };

        if (USE_API) {
          try {
            await logsApi.create({
              userId: logData.userId,
              userName: logData.userName,
              action: logData.action,
              description: logData.description,
              metadata: logData.metadata as Record<string, any>,
              ipAddress: logData.ipAddress,
            });
          } catch (error) {
            console.error('Failed to save activity log to API:', error);
          }
        }

        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },

      // ============ STATISTICS ============
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
