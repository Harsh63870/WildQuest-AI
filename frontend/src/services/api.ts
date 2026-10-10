import {
  AIStatus,
  QuestGenerateRequest,
  QuestGenerateResponse,
  QuestSession,
  JournalGenerateRequest,
  JournalEntry,
  JournalListResponse,
  QuestItem
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' 
          ? errJson.detail 
          : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<{ status: string; privacy: string }>(res);
  },

  async getAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${BASE_URL}/ai/status`);
    return handleResponse<AIStatus>(res);
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/quests/categories`);
    return handleResponse<{
      environments: string[];
      interests: string[];
      experience_levels: string[];
      time_options_minutes: number[];
    }>(res);
  },

  async generateQuests(data: QuestGenerateRequest): Promise<QuestGenerateResponse> {
    const res = await fetch(`${BASE_URL}/quests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<QuestGenerateResponse>(res);
  },

  async createSession(payload: {
    environment: string;
    available_time_minutes: number;
    experience_level: string;
    interests: string[];
    accessibility_preferences?: string;
    quests: QuestItem[];
    fallback_used?: boolean;
    model_used?: string;
  }): Promise<QuestSession> {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<QuestSession>(res);
  },

  async listSessions(): Promise<QuestSession[]> {
    const res = await fetch(`${BASE_URL}/sessions`);
    return handleResponse<QuestSession[]>(res);
  },

  async getSession(sessionId: string): Promise<QuestSession> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    return handleResponse<QuestSession>(res);
  },

  async patchSession(sessionId: string, payload: {
    status?: 'active' | 'completed' | 'abandoned';
    quest_updates?: Record<string, { status: 'pending' | 'completed' | 'skipped'; observation_note?: string }>;
  }): Promise<QuestSession> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<QuestSession>(res);
  },

  async createJournalEntry(data: JournalGenerateRequest): Promise<JournalEntry> {
    const res = await fetch(`${BASE_URL}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<JournalEntry>(res);
  },

  async listJournalEntries(search?: string): Promise<JournalListResponse> {
    const url = search ? `${BASE_URL}/journal?search=${encodeURIComponent(search)}` : `${BASE_URL}/journal`;
    const res = await fetch(url);
    return handleResponse<JournalListResponse>(res);
  },

  async getJournalEntry(entryId: string): Promise<JournalEntry> {
    const res = await fetch(`${BASE_URL}/journal/${entryId}`);
    return handleResponse<JournalEntry>(res);
  },

  async deleteJournalEntry(entryId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/journal/${entryId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete entry: HTTP ${res.status}`);
    }
  },

  getExportJsonUrl(): string {
    return `${BASE_URL}/journal/export/json`;
  }
};
