import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  SkipForward, 
  Clock, 
  Edit3, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  TreePine, 
  Check 
} from 'lucide-react';
import { QuestSession as QuestSessionType, QuestItem } from '../types';
import { api } from '../services/api';

interface QuestSessionProps {
  session: QuestSessionType | null;
  onFinishSession: (completedQuests: QuestItem[], totalElapsedMinutes: number) => void;
  onCancelSession: () => void;
}

export const QuestSession: React.FC<QuestSessionProps> = ({
  session,
  onFinishSession,
  onCancelSession,
}) => {
  const [quests, setQuests] = useState<QuestItem[]>(session?.quests || []);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state if session changes
  useEffect(() => {
    if (session?.quests) {
      setQuests(session.quests);
    }
  }, [session]);

  // Elapsed timer
  useEffect(() => {
    if (!session || session.status === 'completed') return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
          <TreePine className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-forest-950">
          No Active Exploration Session
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          You don't have an active outdoor quest underway. Generate personalized nature missions to begin.
        </p>
        <button
          onClick={onCancelSession}
          className="px-6 py-2.5 rounded-xl bg-forest-900 text-cream text-xs font-semibold hover:bg-forest-950 transition-colors shadow-sm"
        >
          Generate New Quests
        </button>
      </div>
    );
  }

  const completedCount = quests.filter((q) => q.status === 'completed').length;
  const skippedCount = quests.filter((q) => q.status === 'skipped').length;
  const totalCount = quests.length;
  const progressPercent = totalCount > 0 ? Math.round(((completedCount + skippedCount) / totalCount) * 100) : 0;

  const handleUpdateStatus = async (idx: number, status: 'completed' | 'skipped') => {
    const targetQuest = quests[idx];
    const newQuests = [...quests];
    newQuests[idx] = { ...targetQuest, status };
    setQuests(newQuests);

    // Persist to backend
    if (session.id && targetQuest.id) {
      try {
        await api.patchSession(session.id, {
          quest_updates: {
            [targetQuest.id]: {
              status,
              observation_note: targetQuest.observation_note,
            },
          },
        });
      } catch (err) {
        console.error('Failed to update quest status on backend:', err);
      }
    }
  };

  const handleSaveNote = async (idx: number) => {
    const targetQuest = quests[idx];
    const newQuests = [...quests];
    newQuests[idx] = { ...targetQuest, observation_note: noteDraft.trim() || undefined };
    setQuests(newQuests);
    setActiveNoteIndex(null);

    // Persist to backend
    if (session.id && targetQuest.id) {
      try {
        await api.patchSession(session.id, {
          quest_updates: {
            [targetQuest.id]: {
              status: targetQuest.status,
              observation_note: noteDraft.trim() || undefined,
            },
          },
        });
      } catch (err) {
        console.error('Failed to update note on backend:', err);
      }
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    try {
      if (session.id) {
        await api.patchSession(session.id, { status: 'completed' });
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
    } finally {
      setSaving(false);
      onFinishSession(quests, elapsedMins);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Session Progress Header Card */}
      <div className="p-6 rounded-3xl bg-forest-900 text-cream shadow-natural space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sage-300">
              <span className="uppercase tracking-wider font-semibold text-[10px] text-amber-300">
                Active Session
              </span>
              <span>•</span>
              <span className="capitalize">{session.environment}</span>
              <span>•</span>
              <span>Target: {session.available_time_minutes}m</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-cream mt-1">
              Field Exploration in Progress
            </h1>
          </div>

          {/* Live Timer & Finish Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-950/70 border border-forest-800 text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-sage-400 hover:bg-sage-300 text-forest-950 font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Finish & Reflect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-cream-200">
            <span>
              Progress: {completedCount} completed, {skippedCount} skipped of {totalCount}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-forest-950/60 overflow-hidden">
            <div
              className="h-full bg-sage-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-4">
        {quests.map((quest, idx) => {
          const isCompleted = quest.status === 'completed';
          const isSkipped = quest.status === 'skipped';

          return (
            <div
              key={quest.id || idx}
              className={`p-6 rounded-3xl transition-all border ${
                isCompleted
                  ? 'bg-forest-50/50 border-forest-200 shadow-sm'
                  : isSkipped
                  ? 'bg-stone-50 border-stone-200 opacity-70'
                  : 'bg-white border-stone-200/90 parchment-card shadow-natural'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-forest-800 text-cream'
                          : isSkipped
                          ? 'bg-stone-300 text-stone-700'
                          : 'bg-forest-900 text-cream'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </span>

                    <h3 className={`font-serif font-bold text-base sm:text-lg ${
                      isCompleted ? 'text-forest-950' : isSkipped ? 'text-stone-500 line-through' : 'text-stone-900'
                    }`}>
                      {quest.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-8">
                    {quest.description}
                  </p>

                  <div className="pl-8 pt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium capitalize">
                      {quest.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-stone-400" /> {quest.duration_minutes} min
                    </span>
                  </div>

                  {/* Prompts */}
                  <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-3 rounded-xl bg-cream-50 border border-stone-100 text-stone-700">
                      <span className="font-semibold text-forest-900 block text-[11px] mb-0.5">
                        Observation Prompt:
                      </span>
                      {quest.observation_prompt}
                    </div>
                    <div className="p-3 rounded-xl bg-forest-50/50 border border-forest-100/60 text-stone-700">
                      <span className="font-semibold text-forest-900 block text-[11px] mb-0.5">
                        Completion Action:
                      </span>
                      {quest.completion_action}
                    </div>
                  </div>

                  {/* Observation Note Section */}
                  <div className="pl-8 pt-2">
                    {activeNoteIndex === idx ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Record quick tactile, visual, or sound notes from this spot..."
                          className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveNoteIndex(null)}
                            className="px-3 py-1 rounded-lg text-xs text-stone-600 hover:bg-stone-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(idx)}
                            className="px-3 py-1 rounded-lg text-xs bg-forest-800 text-cream font-medium hover:bg-forest-900"
                          >
                            Save Field Note
                          </button>
                        </div>
                      </div>
                    ) : quest.observation_note ? (
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-[10px] text-stone-500 uppercase block">
                            Field Note Recorded:
                          </span>
                          "{quest.observation_note}"
                        </div>
                        <button
                          onClick={() => {
                            setActiveNoteIndex(idx);
                            setNoteDraft(quest.observation_note || '');
                          }}
                          className="text-stone-400 hover:text-stone-700 p-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveNoteIndex(idx);
                          setNoteDraft('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-forest-800 hover:text-forest-950 font-medium py-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Add Observation Note</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Quest Action Buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0 sm:self-center pl-8 sm:pl-0">
                  <button
                    onClick={() => handleUpdateStatus(idx, 'completed')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-forest-800 text-cream shadow-sm'
                        : 'bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(idx, 'skipped')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSkipped
                        ? 'bg-stone-200 text-stone-800'
                        : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
        <button
          onClick={onCancelSession}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream text-xs font-semibold flex items-center gap-2 shadow-natural transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 text-sage-300" />
          <span>Finish Session & Write Journal Reflection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
