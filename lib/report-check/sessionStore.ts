import type { CreateSessionInput, ReviewSession, SessionStore } from "./types";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// In-memory implementation. Swap this file's export for a Redis- or
// database-backed implementation later — the SessionStore interface (see
// types.ts) is the only contract API routes depend on, so nothing else
// needs to change.
class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, ReviewSession>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Periodically sweep expired sessions so the extracted document text
    // (potentially large) doesn't sit in memory indefinitely.
    this.cleanupTimer = setInterval(() => this.sweep(), 10 * 60 * 1000);
    // Don't keep the Node process alive just for this timer.
    this.cleanupTimer?.unref?.();
  }

  private sweep() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (session.expiresAt < now) this.sessions.delete(id);
    }
  }

  async create(input: CreateSessionInput): Promise<ReviewSession> {
    const now = Date.now();
    const session: ReviewSession = {
      id: crypto.randomUUID(),
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
      fileName: input.fileName,
      fileType: input.fileType,
      pageCount: input.pageCount,
      extracted: input.extracted,
   reportedIssueIds: [],
      nextIssueNumber: 1,
      completed: false,
      issueQueue: [],
      fetchInProgress: false,
      chunkIndex: 0,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async get(id: string): Promise<ReviewSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  async update(id: string, patch: Partial<ReviewSession>): Promise<ReviewSession | null> {
    const session = await this.get(id);
    if (!session) return null;
    const updated: ReviewSession = { ...session, ...patch };
    this.sessions.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}

// Singleton across hot-reloads in dev, same pattern as lib/prisma.ts.
const globalForSessionStore = globalThis as unknown as {
  reportCheckSessionStore: SessionStore | undefined;
};

export const sessionStore: SessionStore =
  globalForSessionStore.reportCheckSessionStore ?? new MemorySessionStore();

if (process.env.NODE_ENV !== "production") {
  globalForSessionStore.reportCheckSessionStore = sessionStore;
}
