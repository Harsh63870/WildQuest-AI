import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Compass, 
  Heart, 
  Accessibility, 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  Trees,
  Flower2,
  Building2,
  Footprints,
  Eye,
  Bird,
  Bug,
  CloudSun,
  Volume2,
  Layers
} from 'lucide-react';
import { QuestItem, QuestGenerateResponse } from '../types';
import { api } from '../services/api';

interface QuestGeneratorProps {
  onStartSession: (
    quests: QuestItem[], 
    environment: string, 
    availableTime: number, 
    experienceLevel: string, 
    interests: string[], 
    accessibility?: string,
    fallbackUsed?: boolean,
    modelUsed?: string
  ) => void;
}

const ENVIRONMENTS = [
  { id: 'park', name: 'Urban / City Park', desc: 'Lawns, ponds, and landscaped trees', icon: Trees },
  { id: 'garden', name: 'Botanical or Home Garden', desc: 'Cultivated beds, flowers, and pollinator patches', icon: Flower2 },
  { id: 'campus', name: 'Campus or Quad', desc: 'Walkways, courtyard hedges, and architecture', icon: Building2 },
  { id: 'forest trail', name: 'Forest Trail or Woodland', desc: 'Soil humus, deep shade, and canopy paths', icon: Footprints },
  { id: 'neighborhood', name: 'Neighborhood Street', desc: 'Sidewalk cracks, curb flora, and street trees', icon: MapPin },
];

const INTERESTS = [
  { id: 'plants', label: 'Plants & Foliage', icon: Flower2 },
  { id: 'birds', label: 'Birds & Flight', icon: Bird },
  { id: 'insects', label: 'Insects & Pollinators', icon: Bug },
  { id: 'weather', label: 'Weather & Microclimate', icon: CloudSun },
  { id: 'textures', label: 'Tactile Textures', icon: Layers },
  { id: 'sounds', label: 'Soundscape & Acoustic', icon: Volume2 },
  { id: 'mindful observation', label: 'Mindful Observation', icon: Eye },
];

export const QuestGenerator: React.FC<QuestGeneratorProps> = ({ onStartSession }) => {
  const [environment, setEnvironment] = useState('park');
  const [availableTime, setAvailableTime] = useState<number>(20);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [interests, setInterests] = useState<string[]>(['plants', 'mindful observation']);
  const [accessibility, setAccessibility] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<QuestGenerateResponse | null>(null);

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== id));
      }
    } else {
      setInterests([...interests, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const response = await api.generateQuests({
        environment,
        available_time: availableTime,
        experience_level: experienceLevel,
        interests,
        accessibility_preferences: accessibility.trim() || undefined,
      });
      setGeneratedResult(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmStart = () => {
    if (!generatedResult) return;
    onStartSession(
      generatedResult.quests,
      environment,
      availableTime,
      experienceLevel,
      interests,
      accessibility.trim() || undefined,
      generatedResult.fallback_used,
      generatedResult.model_name
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          <span>Personalized Quest Generator</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
          Craft Your Outdoor Exploration
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Tailored to your immediate environment, timeframe, and interests. Powered locally by open-weight AI.
        </p>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="parchment-card rounded-3xl p-6 sm:p-8 space-y-8">
        
        {/* 1. Environment */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
            1. Select Your Environment
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ENVIRONMENTS.map((env) => {
              const Icon = env.icon;
              const isSelected = environment === env.id;
              return (
                <button
                  type="button"
                  key={env.id}
                  onClick={() => setEnvironment(env.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-forest-900 text-cream border-forest-900 shadow-natural'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-forest-600/40 hover:bg-forest-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-sage-300' : 'text-forest-700'}`} />
                    {isSelected && <span className="w-2 h-2 rounded-full bg-sage-300" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{env.name}</h4>
                    <p className={`text-[11px] mt-1 ${isSelected ? 'text-cream-200/80' : 'text-stone-500'}`}>
                      {env.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Available Time & 3. Experience Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>2. Available Outdoor Time</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setAvailableTime(t)}
                  className={`py-3 px-2 rounded-xl text-center border font-semibold text-xs sm:text-sm transition-all ${
                    availableTime === t
                      ? 'bg-forest-900 text-cream border-forest-900 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {t} Minutes
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              Quests will fit strictly within this time window.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-forest-700" />
              <span>3. Experience Level</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Gentle, easy sensory prompts' },
                { id: 'curious explorer', label: 'Curious Explorer', desc: 'More detailed observation' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    experienceLevel === lvl.id
                      ? 'bg-forest-900 text-cream border-forest-900 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="font-semibold text-xs leading-tight">{lvl.label}</div>
                  <div className={`text-[10px] mt-0.5 ${experienceLevel === lvl.id ? 'text-cream-200/80' : 'text-stone-500'}`}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Interests Multi-select */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-forest-700" />
              <span>4. Exploration Interests</span>
            </span>
            <span className="text-[11px] font-normal text-stone-500 lowercase">
              Select one or more
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => {
              const Icon = item.icon;
              const isChecked = interests.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isChecked
                      ? 'bg-sage-600 text-cream border-sage-700 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Optional Accessibility Preferences */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
            <Accessibility className="w-3.5 h-3.5 text-forest-700" />
            <span>5. Accessibility Preferences (Optional)</span>
          </label>
          <input
            type="text"
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            placeholder="e.g., Paved flat walkways only, seated observation, low-mobility friendly..."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 bg-stone-50/50"
            maxLength={200}
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-forest-900 hover:bg-forest-950 text-cream font-semibold text-sm transition-all shadow-natural flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sage-300" />
                <span>Generating Nature Missions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sage-300" />
                <span>Generate Exploration Quests ({availableTime} min)</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Result Preview */}
      {generatedResult && (
        <div className="space-y-6 pt-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-forest-50/80 border border-forest-200/60">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-forest-700" />
              <span className="text-xs font-semibold text-forest-950">
                {generatedResult.fallback_used
                  ? 'Generated with Deterministic Nature Templates (Offline Mode)'
                  : `Generated with Local Model (${generatedResult.model_name})`}
              </span>
            </div>
            <div className="text-xs text-forest-800 font-medium">
              Total Duration: {generatedResult.total_duration_minutes} / {availableTime} mins
            </div>
          </div>

          <div className="space-y-3">
            {generatedResult.quests.map((quest, idx) => (
              <div
                key={quest.id || idx}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-forest-900 text-cream text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      {quest.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium capitalize">
                      {quest.category}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-forest-800">
                      <Clock className="w-3 h-3" /> {quest.duration_minutes}m
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {quest.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                  <div className="p-2.5 rounded-xl bg-cream-50 text-stone-700">
                    <span className="font-semibold text-forest-900 block text-[11px] mb-0.5">
                      Observation Focus:
                    </span>
                    {quest.observation_prompt}
                  </div>
                  <div className="p-2.5 rounded-xl bg-forest-50/50 text-stone-700">
                    <span className="font-semibold text-forest-900 block text-[11px] mb-0.5">
                      Action:
                    </span>
                    {quest.completion_action}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleConfirmStart}
              className="py-3 px-8 rounded-2xl bg-forest-900 hover:bg-forest-950 text-cream font-semibold text-sm shadow-natural hover:shadow-natural-lg flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span>Begin Active Session</span>
              <ArrowRight className="w-4 h-4 text-sage-300" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
