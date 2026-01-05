
// API Service for making HTTP requests to the backend

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============ USERS ============
export const usersApi = {
  getAll: () => fetchApi<any[]>('/users'),

  getById: (id: string) => fetchApi<any>(`/users/${id}`),

  create: (data: {
    name: string;
    email: string;
    role?: string;
    secretKeyHash: string;
    isActive?: boolean;
    jobTitle?: string;
  }) => fetchApi<any>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<{
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    jobTitle: string;
  }>) => fetchApi<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => fetchApi<any>(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// ============ LETTERS ============
export const lettersApi = {
  getAll: () => fetchApi<any[]>('/letters'),

  getById: (id: string) => fetchApi<any>(`/letters/${id}`),

  create: (data: {
    letterNumber: string;
    letterDate: string;
    subject: string;
    attachment: string;
    content?: string;
    createdById: string;
  }) => fetchApi<any>('/letters', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<{
    letterNumber: string;
    letterDate: Date | string;
    subject: string;
    attachment: string;
    content: string;
  }>) => {
    // Convert Date to ISO string if present
    const payload = { ...data };
    if (payload.letterDate instanceof Date) {
      payload.letterDate = payload.letterDate.toISOString();
    }
    return fetchApi<any>(`/letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete: (id: string) => fetchApi<any>(`/letters/${id}`, {
    method: 'DELETE',
  }),

  sign: (id: string, data: {
    signerId: string;
    signerName: string;
    contentHash: string;
    qrCodeUrl: string;
    metadata?: Record<string, any>;
  }) => fetchApi<any>(`/letters/${id}/sign`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ============ EVENTS ============
export const eventsApi = {
  getAll: () => fetchApi<any[]>('/events'),

  getById: (id: string) => fetchApi<any>(`/events/${id}`),

  create: (data: {
    name: string;
    date: string;
    claimDeadline: string;
    templateUrl?: string;
    templateConfig?: Record<string, any>;
    createdById: string;
  }) => fetchApi<any>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<{
    name: string;
    date: Date | string;
    claimDeadline: Date | string;
    templateUrl: string;
    templateConfig: Record<string, any>;
  }>) => {
    // Convert Dates to ISO strings if present
    const payload: Record<string, any> = { ...data };
    if (payload.date instanceof Date) {
      payload.date = payload.date.toISOString();
    }
    if (payload.claimDeadline instanceof Date) {
      payload.claimDeadline = payload.claimDeadline.toISOString();
    }
    return fetchApi<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete: (id: string) => fetchApi<any>(`/events/${id}`, {
    method: 'DELETE',
  }),

  getClaims: (eventId: string) => fetchApi<any[]>(`/events/${eventId}/claims`),

  claimCertificate: (eventId: string, data: {
    recipientName: string;
    callSign?: string;
    userId?: string;
  }) => fetchApi<any>(`/events/${eventId}/claims`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ============ ACTIVITY LOGS ============
export const logsApi = {
  getAll: () => fetchApi<any[]>('/logs'),

  create: (data: {
    userId: string;
    userName: string;
    action: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }) => fetchApi<any>('/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ============ SIGNATURES ============
export const signaturesApi = {
  getAll: () => fetchApi<any[]>('/signatures'),
};

// ============ STATS ============
export const statsApi = {
  get: () => fetchApi<{
    totalLetters: number;
    signedLetters: number;
    draftLetters: number;
    invalidLetters: number;
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    totalClaims: number;
  }>('/stats'),
};

// ============ VERIFY ============
export const verifyApi = {
  verify: (id: string) => fetchApi<any>(`/verify/${id}`),
};

// ============ AUTH ============
export const authApi = {
  login: (email: string, password: string) => fetchApi<{
    user: any;
    message: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
};
