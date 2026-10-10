import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Sun, 
  Calendar,
  Layers
} from 'lucide-react';
import { JournalEntry, AIStatus } from '../types';
import { formatDuration, formatLocalDate } from '../utils/formatters';

interface DashboardProps {
  onStartQuest: () => void;
  onViewJournal: () => void;
  onOpenPrivacy: () => void;
  onOpenEntry: (entry: JournalEntry) => void;
  totalQuests: number;
  totalMinutes: number;
  recentEntries: JournalEntry[];
  aiStatus: AIStatus | null;
  categoriesExplored: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartQuest,
  onViewJournal,
  onOpenPrivacy,
  onOpenEntry,
  totalQuests,
  totalMinutes,
  recentEntries,
  aiStatus,
  categoriesExplored,
}) => {
  // Generate daily mindful prompt based on day of year
  const getTodayInvitation = () => {
    const invitations = [
      {
        title: "The Subtle Shift of Shadows",
        prompt: "Step outside and notice how cast shadows change edge sharpness between tall structures and foliage.",
        time: "10 mins",
        focus: "Visual Mindfulness"
      },
      {
        title: "Acoustic Horizon Sieve",
        prompt: "Close your eyes for 60 seconds. Count three distinct non-human sounds carried by the ambient breeze.",
        time: "10 mins",
        focus: "Soundscape Awareness"
      },
      {
        title: "Texture Contrast Study",
        prompt: "Locate one man-made surface and one natural surface side-by-side. Observe where dust and lichen gather.",
        time: "15 mins",
        focus: "Tactile Botany"
      },
      {
        title: "Micro-Ecosystem on Stone",
        prompt: "Search the base of a curb, stone step, or garden retaining wall for miniature moss cushions.",
        time: "10 mins",
        focus: "Micro-Discovery"
      },
      {
        title: "Wind Velocity & Cloud Heading",
        prompt: "Look skyward through branch silhouettes to perceive the prevailing wind speed at canopy height.",
        time: "15 mins",
        focus: "Meteorology"
      }
    ];
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % invitations.length;
    return invitations[day];
  };

  const todayInvite = getTodayInvitation();
  const isModelReady = aiStatus?.connected && aiStatus?.model_available;

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Hero Invitation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-cream p-8 sm:p-12 shadow-natural-lg">
        {/* Decorative background foliage circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-forest-700/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-sage-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-forest-600/40 text-sage-200 text-xs font-medium tracking-wide">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Today's Outdoor Invitation</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-cream-50 leading-tight">
              Less scrolling. <br />
              <span className="text-sage-300 font-normal italic">More discovering.</span>
            </h1>
            <p className="text-sm sm:text-base text-cream-200/90 leading-relaxed max-w-2xl pt-1">
              Step away from glowing screens for 10 to 30 mindful minutes. Let local AI generate achievable micro-missions in your immediate surroundings—with zero tracking and complete privacy.
            </p>
          </div>

          {/* Today's Mission Prompt Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-forest-950/50 border border-forest-700/50 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-sage-300">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-300">
                {todayInvite.focus}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {todayInvite.time}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-cream-50">
              {todayInvite.title}
            </h3>
            <p className="text-xs sm:text-sm text-cream-300 leading-relaxed">
              "{todayInvite.prompt}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartQuest}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-sage-400 hover:bg-sage-300 text-forest-950 font-semibold text-sm transition-all shadow-natural hover:shadow-natural-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-forest-900" />
              <span>Start a Nature Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewJournal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-forest-800/80 hover:bg-forest-700/80 text-cream-100 font-medium text-xs border border-forest-600/50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-sage-300" />
              <span>Browse Field Journal ({recentEntries.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Architecture Quick Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl parchment-card parchment-card-hover space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Quests Done</span>
            <div className="p-2 rounded-xl bg-forest-50 text-forest-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {totalQuests}
          </div>
          <p className="text-[11px] text-stone-500">Mindful exploration missions</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card parchment-card-hover space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Outdoor Time</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {formatDuration(totalMinutes)}
          </div>
          <p className="text-[11px] text-stone-500">Screen-free nature presence</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card parchment-card-hover space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Journal Notes</span>
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {recentEntries.length}
          </div>
          <p className="text-[11px] text-stone-500">Reflective field entries</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card parchment-card-hover space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Categories</span>
            <div className="p-2 rounded-xl bg-forest-50 text-forest-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {categoriesExplored.length}
          </div>
          <p className="text-[11px] text-stone-500">Distinct nature themes</p>
        </div>
      </div>

      {/* Two Pillars: Local AI Status & Privacy Sovereignty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Local AI Engine Status Card */}
        <div className="p-6 rounded-2xl parchment-card border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest-50 text-forest-800">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-forest-950 text-base">
                  Local AI Inference Engine
                </h3>
                <p className="text-xs text-stone-500">
                  Powered by Ollama ({aiStatus?.configured_model || 'qwen2.5:3b'})
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isModelReady 
                ? 'bg-forest-100 text-forest-800' 
                : 'bg-stone-100 text-stone-700'
            }`}>
              {isModelReady ? 'Local Model Active' : 'Offline Mode'}
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {aiStatus?.message || 'Checking local Ollama connection...'}
          </p>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs text-stone-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-400">Engine Type:</span>
              <span className="font-medium text-stone-800">
                {isModelReady ? 'On-Device LLM (Ollama)' : 'Deterministic Nature Catalog'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Cloud AI Fallback:</span>
              <span className="font-medium text-forest-700">Strictly Disabled (Zero Cloud Leakage)</span>
            </div>
          </div>
        </div>

        {/* Local-First Privacy Guarantee Card */}
        <div className="p-6 rounded-2xl parchment-card border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sage-50 text-sage-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-forest-950 text-base">
                  100% Local-First Privacy
                </h3>
                <p className="text-xs text-stone-500">
                  SQLite database • Zero remote telemetry
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPrivacy}
              className="text-xs text-forest-800 hover:text-forest-950 font-medium underline underline-offset-2"
            >
              Inspect
            </button>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Your observations, surprises, and personal feelings are stored solely on your machine inside <code>wildquest.db</code>. No GPS coordinates or device sensors are ever requested.
          </p>

          <div className="bg-sage-50/50 rounded-xl p-3 border border-sage-100 text-xs text-forest-900 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
              <span>Full exportability anytime as JSON and Markdown</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
              <span>No user accounts or third-party cookies</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Field Journal Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-forest-950">
              Recent Field Reflections
            </h2>
            <p className="text-xs text-stone-500">
              Your recent observations grounded in direct outdoor experience
            </p>
          </div>
          {recentEntries.length > 0 && (
            <button
              onClick={onViewJournal}
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1 transition-colors"
            >
              <span>View All Entries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl parchment-card border border-dashed border-stone-300 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-forest-950">
              No field reflections written yet
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Your journal will populate with thoughtful reflections once you complete your first nature quest session.
            </p>
            <div className="pt-2">
              <button
                onClick={onStartQuest}
                className="px-4 py-2 rounded-xl bg-forest-800 text-cream-50 text-xs font-medium hover:bg-forest-900 transition-colors shadow-sm"
              >
                Embark on First Quest
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentEntries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry)}
                className="p-5 rounded-2xl parchment-card parchment-card-hover cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1 text-forest-700 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatLocalDate(entry.created_at)}
                    </span>
                    <span>{entry.total_outdoor_minutes} mins</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-forest-950 line-clamp-1">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {entry.narrative}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {entry.nature_categories.slice(0, 2).map((cat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium capitalize"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <span className="text-forest-800 font-semibold flex items-center gap-0.5">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
