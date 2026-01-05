import { RateLimitEntry } from '@/types';

// Konfigurasi rate limiting
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit

// Store untuk rate limiting (dalam real app, gunakan Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check apakah identifier (IP/userId) diblokir
 */
export function isBlocked(identifier: string): { blocked: boolean; remainingTime?: number } {
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return { blocked: false };
  }

  if (entry.blockedUntil) {
    const now = new Date();
    if (now < entry.blockedUntil) {
      const remainingTime = Math.ceil((entry.blockedUntil.getTime() - now.getTime()) / 1000);
      return { blocked: true, remainingTime };
    }
    // Block sudah expired, reset
    rateLimitStore.delete(identifier);
    return { blocked: false };
  }

  return { blocked: false };
}

/**
 * Record attempt dan check apakah harus diblokir
 */
export function recordAttempt(identifier: string, success: boolean): {
  blocked: boolean;
  attempts?: number;
  remainingTime?: number;
} {
  const entry = rateLimitStore.get(identifier) || {
    attempts: 0,
    lastAttempt: new Date(),
  };

  if (success) {
    // Reset on success
    rateLimitStore.delete(identifier);
    return { blocked: false };
  }

  entry.attempts += 1;
  entry.lastAttempt = new Date();

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
    rateLimitStore.set(identifier, entry);
    return {
      blocked: true,
      attempts: entry.attempts,
      remainingTime: Math.ceil(BLOCK_DURATION_MS / 1000),
    };
  }

  rateLimitStore.set(identifier, entry);
  return {
    blocked: false,
    attempts: entry.attempts,
  };
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(identifier: string): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - entry.attempts);
}

/**
 * Clear rate limit untuk identifier tertentu (admin use)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
