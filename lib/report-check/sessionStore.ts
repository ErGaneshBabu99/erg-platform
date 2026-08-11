import { prisma } from "@/lib/prisma";
import type { CreateSessionInput, ReviewSession, SessionStore, ReviewIssue } from "./types";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Database-backed implementation of SessionStore. Replaces the old
// in-memory Map, which did not survive across Vercel's serverless
// function instances (a session created in one request could be
// invisible to the very next request for the same session id).
class DatabaseSessionStore implements SessionStore {
  async create(input: CreateSessionInput): Promise<ReviewSession> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;

    const row = await prisma.reportCheckSession.create({
      data: {
        id,
        expiresAt: new Date(expiresAt),
        fileName: input.fileName,
        fileType: input.fileType,
        pageCount: input.pageCount,
        extracted: input.extracted as object,
        reportedIssueIds: [],
        nextIssueNumber: 1,
        completed: false,
        issueQueue: [],
        fetchInProgress: false,
        chunkIndex: 0,
      },
    });

    return this.toSession(row);
  }

  async get(id: string): Promise<ReviewSession | null> {
    const row = await prisma.reportCheckSession.findUnique({ where: { id } });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await prisma.reportCheckSession.delete({ where: { id } }).catch(() => {});
      return null;
    }
    return this.toSession(row);
  }

  async update(id: string, patch: Partial<ReviewSession>): Promise<ReviewSession | null> {
    const existing = await this.get(id);
    if (!existing) return null;

    const row = await prisma.reportCheckSession.update({
      where: { id },
      data: {
        ...(patch.fileName !== undefined ? { fileName: patch.fileName } : {}),
        ...(patch.fileType !== undefined ? { fileType: patch.fileType } : {}),
        ...(patch.pageCount !== undefined ? { pageCount: patch.pageCount } : {}),
        ...(patch.extracted !== undefined ? { extracted: patch.extracted as object } : {}),
        ...(patch.reportedIssueIds !== undefined
          ? { reportedIssueIds: patch.reportedIssueIds }
          : {}),
        ...(patch.nextIssueNumber !== undefined
          ? { nextIssueNumber: patch.nextIssueNumber }
          : {}),
        ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
        ...(patch.issueQueue !== undefined ? { issueQueue: patch.issueQueue as object } : {}),
        ...(patch.fetchInProgress !== undefined
          ? { fetchInProgress: patch.fetchInProgress }
          : {}),
        ...(patch.chunkIndex !== undefined ? { chunkIndex: patch.chunkIndex } : {}),
      },
    });

    return this.toSession(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.reportCheckSession.delete({ where: { id } }).catch(() => {});
  }

  private toSession(row: {
    id: string;
    createdAt: Date;
    expiresAt: Date;
    fileName: string;
    fileType: string;
    pageCount: number | null;
    extracted: unknown;
    reportedIssueIds: unknown;
    nextIssueNumber: number;
    completed: boolean;
    issueQueue: unknown;
    fetchInProgress: boolean;
    chunkIndex: number;
  }): ReviewSession {
    return {
      id: row.id,
      createdAt: row.createdAt.getTime(),
      expiresAt: row.expiresAt.getTime(),
      fileName: row.fileName,
      fileType: row.fileType as ReviewSession["fileType"],
      pageCount: row.pageCount,
      extracted: row.extracted as ReviewSession["extracted"],
      reportedIssueIds: (row.reportedIssueIds as string[]) ?? [],
      nextIssueNumber: row.nextIssueNumber,
      completed: row.completed,
      issueQueue: (row.issueQueue as ReviewIssue[]) ?? [],
      fetchInProgress: row.fetchInProgress,
      chunkIndex: row.chunkIndex,
    };
  }
}

export const sessionStore: SessionStore = new DatabaseSessionStore();