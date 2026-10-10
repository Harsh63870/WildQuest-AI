import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { JournalEntry, QuestItem } from '../types';
import { api } from '../services/api';

interface JournalEntryFormProps {
  sessionId?: string;
  completedQuests: QuestItem[];
  outdoorMinutes: number;
  initialObservations?: string;
  onSaved: (entry: JournalEntry) => void;
  onCancel: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  sessionId,
  completedQuests,
  outdoorMinutes,
  initialObservations = '',
  onSaved,
  onCancel,
}) => {
  const [observations, setObservations] = useState(initialObservations);
  const [surprises, setSurprises] = useState('');
  const [learnings, setLearnings] = useState('');
  const [feeling, setFeeling] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract nature categories from completed quests
  const categories = Array.from(new Set(completedQuests.map((q) => q.category))).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observations.trim()) {
      setError('Please share at least a few words about what you observed outdoors.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entry = await api.createJournalEntry({
        session_id: sessionId,
        user_observations: observations.trim(),
        user_surprises: surprises.trim() || undefined,
        user_learnings: learnings.trim() || undefined,
        user_feeling: feeling.trim() || undefined,
        nature_categories: categories,
        total_outdoor_minutes: outdoorMinutes,
        completed_quests_count: completedQuests.filter((q) => q.status === 'completed').length,
      });

      onSaved(entry);
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize journal reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 text-forest-800 text-xs font-semibold">
          <Feather className="w-3.5 h-3.5 text-forest-600" />
          <span>Reflective Nature Journal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
          Synthesize Your Field Notes
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Record your direct observations. The local AI will synthesize a mindful reflection grounded strictly in what you experienced.
        </p>
      </div>

      {/* Session Summary Tag Card */}
      <div className="p-4 rounded-2xl bg-forest-900 text-cream text-xs flex flex-wrap items-center justify-between gap-3 shadow-natural">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300">Session Completed:</span>
          <span>{completedQuests.filter((q) => q.status === 'completed').length} quests finished</span>
          <span>•</span>
          <span>{outdoorMinutes} outdoor minutes recorded</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-sage-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-300" />
          <span>100% On-device privacy</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="parchment-card rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Observations (Required) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
            What did you observe? <span className="text-amber-600 font-normal">* (Required)</span>
          </label>
          <p className="text-[11px] text-stone-500">
            Colors, textures, tree bark, shadows, weather, bird calls, moss patches, or sidewalk flora.
          </p>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="e.g. Noticed damp green moss in the north shade of a brick wall. A sparrow hopped between dry leaves searching for seeds..."
            rows={4}
            required
            className="w-full p-4 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 bg-stone-50/50 leading-relaxed"
          />
        </div>

        {/* Surprises (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
            What surprised you? <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={surprises}
            onChange={(e) => setSurprises(e.target.value)}
            placeholder="e.g. How quiet the street became once I listened specifically for bird calls..."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 bg-stone-50/50"
          />
        </div>

        {/* Learnings (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
            What did you learn or notice about nature? <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="e.g. Tree shadows move faster than I expected as the afternoon advances..."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 bg-stone-50/50"
          />
        </div>

        {/* Feelings (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
            How did the outdoor experience feel? <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="e.g. Calming, restorative, eye-opening, grounding..."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 bg-stone-50/50"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-cream font-semibold text-xs sm:text-sm shadow-natural flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sage-300" />
                <span>Synthesizing Reflection...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sage-300" />
                <span>Synthesize & Save to Journal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
