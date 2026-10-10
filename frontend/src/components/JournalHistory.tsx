import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { JournalEntry } from '../types';
import { formatLocalDate } from '../utils/formatters';
import { downloadMarkdownFile } from '../utils/export';
import { api } from '../services/api';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => Promise<void>;
  onRefresh?: () => void;
  onStartQuest: () => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  entries,
  onDeleteEntry,
  onStartQuest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter entries
  const filtered = entries.filter((e) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.narrative.toLowerCase().includes(q) ||
      e.user_observations.toLowerCase().includes(q) ||
      e.nature_categories.some((c) => c.toLowerCase().includes(q))
    );
  });

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await onDeleteEntry(deleteCandidate.id);
      if (selectedEntry?.id === deleteCandidate.id) {
        setSelectedEntry(null);
      }
      setDeleteCandidate(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportFullJson = () => {
    const url = api.getExportJsonUrl();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wildquest_journal_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-forest-600" />
            <span>Field Observations & Musings</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
            Nature Journal History
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {entries.length} reflections recorded locally on your device
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullJson}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 font-semibold text-xs border border-forest-200 transition-colors shadow-sm"
              title="Download entire journal as JSON file"
            >
              <Download className="w-3.5 h-3.5 text-forest-700" />
              <span>Export Full Journal (JSON)</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      {entries.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reflections by plants, birds, feeling, or observation keywords..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl parchment-card border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-forest-50 text-forest-800 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-forest-950">
            Your Nature Journal is Empty
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Every walk outside leaves an impression. Embark on a quick 10-minute quest to log your first field notes and watch this journal bloom.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartQuest}
              className="px-6 py-3 rounded-2xl bg-forest-900 text-cream text-xs sm:text-sm font-semibold hover:bg-forest-950 transition-all shadow-natural"
            >
              Start First Quest
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-stone-200 text-stone-500 text-xs">
          No reflections found matching "{searchTerm}". Try a different term.
        </div>
      ) : (
        /* Entries Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-3xl parchment-card parchment-card-hover flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1.5 text-forest-700 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatLocalDate(entry.created_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{entry.total_outdoor_minutes} mins</span>
                  </div>
                </div>

                <h3 
                  onClick={() => setSelectedEntry(entry)}
                  className="font-serif font-bold text-lg text-forest-950 cursor-pointer hover:text-forest-700 transition-colors line-clamp-1"
                >
                  {entry.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {entry.narrative}
                </p>

                {/* Takeaways snippet */}
                {entry.takeaways && entry.takeaways.length > 0 && (
                  <div className="p-3 rounded-xl bg-cream-50/80 border border-stone-100 text-[11px] text-stone-700 space-y-1">
                    <span className="font-semibold text-forest-900 block text-[10px] uppercase tracking-wider">
                      Takeaway Focus:
                    </span>
                    <p className="line-clamp-1">
                      • {entry.takeaways[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {entry.nature_categories.map((cat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium capitalize"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadMarkdownFile(entry)}
                    className="p-1.5 text-stone-400 hover:text-forest-800 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Export as Markdown (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteCandidate(entry)}
                    className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="px-3 py-1.5 rounded-xl bg-forest-900 text-cream text-[11px] font-semibold flex items-center gap-1 hover:bg-forest-950 transition-colors shadow-sm"
                  >
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedEntry(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-stone-200 space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-forest-700 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatLocalDate(selectedEntry.created_at)}</span>
                    <span>•</span>
                    <span>{selectedEntry.total_outdoor_minutes} mins outside</span>
                    <span>•</span>
                    <span>{selectedEntry.completed_quests_count} quests</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950">
                    {selectedEntry.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reflection Narrative */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                  Reflective Narrative
                </h4>
                <div className="p-4 rounded-2xl bg-cream-50 border border-stone-200/80 text-xs sm:text-sm text-stone-800 leading-relaxed font-serif whitespace-pre-line">
                  {selectedEntry.narrative}
                </div>
              </div>

              {/* Takeaways & Future Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-2 text-xs">
                  <h4 className="font-semibold text-forest-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-forest-700" />
                    Key Takeaways
                  </h4>
                  <ul className="space-y-1.5 text-stone-700 list-disc list-inside">
                    {selectedEntry.takeaways.map((t, idx) => (
                      <li key={idx} className="leading-relaxed">{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2 text-xs">
                  <h4 className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Suggested Future Activity
                  </h4>
                  <p className="text-stone-700 leading-relaxed">
                    {selectedEntry.future_activity}
                  </p>
                </div>
              </div>

              {/* Raw User Notes */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-700 space-y-1.5">
                <span className="font-semibold text-stone-900 block text-[11px] uppercase tracking-wider">
                  Raw Field Observations:
                </span>
                <p>"{selectedEntry.user_observations}"</p>
                {selectedEntry.user_surprises && (
                  <p className="text-stone-500"><strong className="text-stone-700">Surprise:</strong> {selectedEntry.user_surprises}</p>
                )}
                {selectedEntry.user_learnings && (
                  <p className="text-stone-500"><strong className="text-stone-700">Learnings:</strong> {selectedEntry.user_learnings}</p>
                )}
                {selectedEntry.user_feeling && (
                  <p className="text-stone-500"><strong className="text-stone-700">Feeling:</strong> {selectedEntry.user_feeling}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setDeleteCandidate(selectedEntry)}
                  className="px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entry</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadMarkdownFile(selectedEntry)}
                    className="px-4 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 font-semibold text-xs border border-forest-200 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Markdown</span>
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-5 py-2 rounded-xl bg-forest-900 text-cream font-medium text-xs hover:bg-forest-950"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-forest-950/40 backdrop-blur-sm"
            onClick={() => setDeleteCandidate(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-rose-50 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Delete Nature Reflection?
                  </h3>
                  <p className="text-xs text-stone-500">
                    This will permanently delete "{deleteCandidate.title}" from your local SQLite database.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 text-xs bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl shadow-sm"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
