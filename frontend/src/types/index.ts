export interface AIStatus {
  connected: boolean;
  model_available: boolean;
  configured_model: string;
  installed_models: string[];
  fallback_mode: boolean;
  message: string;
}

export interface QuestItem {
  id?: string;
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  observation_prompt: string;
  completion_action: string;
  status: 'pending' | 'completed' | 'skipped';
  observation_note?: string;
  order_index?: number;
}

export interface QuestGenerateRequest {
  environment: string;
  available_time: number;
  experience_level: string;
  interests: string[];
  accessibility_preferences?: string;
}

export interface QuestGenerateResponse {
  quests: QuestItem[];
  total_duration_minutes: number;
  fallback_used: boolean;
  source: string;
  model_name: string;
  message: string;
}

export interface QuestSession {
  id: string;
  environment: string;
  available_time_minutes: number;
  experience_level: string;
  interests: string[];
  accessibility_preferences?: string;
  total_duration_minutes: number;
  completed_count: number;
  status: 'active' | 'completed' | 'abandoned';
  fallback_used: boolean;
  model_used?: string;
  created_at: string;
  completed_at?: string;
  quests: QuestItem[];
}

export interface JournalGenerateRequest {
  session_id?: string;
  user_observations: string;
  user_surprises?: string;
  user_learnings?: string;
  user_feeling?: string;
  nature_categories?: string[];
  total_outdoor_minutes?: number;
  completed_quests_count?: number;
}

export interface JournalEntry {
  id: string;
  session_id?: string;
  title: string;
  narrative: string;
  takeaways: string[];
  future_activity: string;
  user_observations: string;
  user_surprises?: string;
  user_learnings?: string;
  user_feeling?: string;
  nature_categories: string[];
  total_outdoor_minutes: number;
  completed_quests_count: number;
  fallback_used: boolean;
  created_at: string;
}

export interface JournalListResponse {
  entries: JournalEntry[];
  total_count: number;
  total_minutes: number;
  total_completed_quests: number;
  categories_explored: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  unlocked: boolean;
  progressPercentage: number;
  requirementText: string;
}
