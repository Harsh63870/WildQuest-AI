import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Layers, 
  Footprints, 
  Feather, 
  TreePine, 
  Sun, 
  Leaf, 
  Lock,
  HeartHandshake
} from 'lucide-react';
import { computeAchievements, formatDuration } from '../utils/formatters';

interface ProgressStatsProps {
  totalQuests: number;
  totalMinutes: number;
  totalSessions: number;
  categoriesExplored: string[];
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  totalQuests,
  totalMinutes,
  totalSessions,
  categoriesExplored,
}) => {
  const achievements = computeAchievements(
    totalQuests,
    totalMinutes,
    totalSessions,
    categoriesExplored.length
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const renderBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Footprints':
        return <Footprints className="w-5 h-5" />;
      case 'Feather':
        return <Feather className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'TreePine':
        return <TreePine className="w-5 h-5" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5" />;
      case 'Sun':
        return <Sun className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-forest-600" />
          <span>Real Milestones • No Guilt Streaks</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
          Your Natural Progression
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Honoring actual moments spent observing nature. Unlocked strictly by your stored activity, with zero manipulative streak mechanics.
        </p>
      </div>

      {/* Cumulative Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl parchment-card space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Total Quests Done
          </span>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {totalQuests}
          </div>
          <p className="text-[11px] text-stone-400">Outdoor missions</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Outdoor Time
          </span>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {formatDuration(totalMinutes)}
          </div>
          <p className="text-[11px] text-stone-400">Minutes in nature</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Sessions Finished
          </span>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {totalSessions}
          </div>
          <p className="text-[11px] text-stone-400">Walks completed</p>
        </div>

        <div className="p-5 rounded-2xl parchment-card space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Categories Visited
          </span>
          <div className="text-3xl font-serif font-bold text-forest-950">
            {categoriesExplored.length}
          </div>
          <p className="text-[11px] text-stone-400">Ecological themes</p>
        </div>
      </div>

      {/* Categories Explored Pills */}
      {categoriesExplored.length > 0 && (
        <div className="p-6 rounded-3xl parchment-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-700" />
              <span>Explored Nature Dimensions</span>
            </h3>
            <span className="text-xs text-stone-500">
              {categoriesExplored.length} distinct themes touched
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {categoriesExplored.map((cat, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-200/80 text-forest-900 text-xs font-medium capitalize"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif font-bold text-xl text-forest-950">
              Earned Badges
            </h3>
            <p className="text-xs text-stone-500">
              {unlockedCount} of {achievements.length} unlocked based on SQLite records
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-forest-100 text-forest-900 font-semibold text-xs">
            {unlockedCount}/{achievements.length} Completed
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-white border-forest-200/90 parchment-card shadow-sm'
                  : 'bg-stone-50/60 border-stone-200/60 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ach.unlocked
                        ? 'bg-forest-900 text-sage-300 shadow-sm'
                        : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    {renderBadgeIcon(ach.badge)}
                  </div>

                  {ach.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 text-[10px] font-bold border border-forest-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-forest-600" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-sm text-forest-950">
                  {ach.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Requirement:</span>
                  <span className="font-medium text-stone-700">{ach.requirementText}</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ach.unlocked ? 'bg-forest-700' : 'bg-stone-400'
                    }`}
                    style={{ width: `${ach.progressPercentage}%` }}
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Gentle Mindfulness Note */}
      <div className="p-5 rounded-2xl bg-cream-100/70 border border-stone-200/70 text-xs text-stone-600 flex items-center gap-3">
        <HeartHandshake className="w-5 h-5 text-forest-700 shrink-0" />
        <p className="leading-relaxed">
          <strong>A note on digital health:</strong> WildQuest AI deliberately excludes daily streak alarms and guilt messages. The forest does not keep score; explore whenever your mind asks for fresh air.
        </p>
      </div>

    </div>
  );
};
