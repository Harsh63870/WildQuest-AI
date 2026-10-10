import { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { QuestGenerator } from './components/QuestGenerator';
import { QuestSession } from './components/QuestSession';
import { JournalEntryForm } from './components/JournalEntryForm';
import { JournalHistory } from './components/JournalHistory';
import { ProgressStats } from './components/ProgressStats';
import { PrivacyModal } from './components/PrivacyModal';
import { useAIStatus } from './hooks/useAIStatus';
import { QuestSession as QuestSessionType, QuestItem, JournalEntry } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // AI Status
  const { status: aiStatus, loading: aiLoading, refresh: refreshAI } = useAIStatus();

  // Active Quest Session State
  const [activeSession, setActiveSession] = useState<QuestSessionType | null>(null);

  // Journal Reflection Form State (when a session finishes)
  const [finishingSessionData, setFinishingSessionData] = useState<{
    sessionId?: string;
    completedQuests: QuestItem[];
    elapsedMinutes: number;
    initialNotes?: string;
  } | null>(null);

  // Journal data
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [totalQuests, setTotalQuests] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [categoriesExplored, setCategoriesExplored] = useState<string[]>([]);

  // Fetch journal entries & stats
  const fetchJournal = useCallback(async () => {
    try {
      const data = await api.listJournalEntries();
      setJournalEntries(data.entries);
      setTotalQuests(data.total_completed_quests);
      setTotalMinutes(data.total_minutes);
      setCategoriesExplored(data.categories_explored);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    }
  }, []);

  useEffect(() => {
    fetchJournal();
  }, [fetchJournal]);

  // Handle starting a new quest session from QuestGenerator
  const handleStartSession = async (
    quests: QuestItem[],
    environment: string,
    availableTime: number,
    experienceLevel: string,
    interests: string[],
    accessibility?: string,
    fallbackUsed?: boolean,
    modelUsed?: string
  ) => {
    try {
      const createdSession = await api.createSession({
        environment,
        available_time_minutes: availableTime,
        experience_level: experienceLevel,
        interests,
        accessibility_preferences: accessibility,
        quests,
        fallback_used: fallbackUsed,
        model_used: modelUsed,
      });
      setActiveSession(createdSession);
      setActiveTab('session');
    } catch (err) {
      console.error('Failed to persist session, using local session state:', err);
      // Fallback local session if backend error
      const mockSess: QuestSessionType = {
        id: `sess_local_${Date.now()}`,
        environment,
        available_time_minutes: availableTime,
        experience_level: experienceLevel,
        interests,
        accessibility_preferences: accessibility,
        total_duration_minutes: availableTime,
        completed_count: 0,
        status: 'active',
        fallback_used: !!fallbackUsed,
        model_used: modelUsed,
        created_at: new Date().toISOString(),
        quests,
      };
      setActiveSession(mockSess);
      setActiveTab('session');
    }
  };

  // Handle finishing active session -> prompt for journal entry
  const handleFinishSession = (completedQuests: QuestItem[], elapsedMinutes: number) => {
    // Gather all notes taken during session
    const notes = completedQuests
      .map((q) => q.observation_note)
      .filter(Boolean)
      .join(' ')
      .trim();

    setFinishingSessionData({
      sessionId: activeSession?.id,
      completedQuests,
      elapsedMinutes,
      initialNotes: notes,
    });
    setActiveSession(null);
  };

  // Handle journal saved
  const handleJournalSaved = (_newEntry: JournalEntry) => {
    setFinishingSessionData(null);
    fetchJournal();
    setActiveTab('journal');
  };

  // Handle deleting entry
  const handleDeleteEntry = async (id: string) => {
    await api.deleteJournalEntry(id);
    fetchJournal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-earth-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveSession={!!activeSession}
        aiStatus={aiStatus}
        aiLoading={aiLoading}
        onRefreshAI={refreshAI}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* If user is finishing a session and writing reflection */}
        {finishingSessionData ? (
          <JournalEntryForm
            sessionId={finishingSessionData.sessionId}
            completedQuests={finishingSessionData.completedQuests}
            outdoorMinutes={finishingSessionData.elapsedMinutes}
            initialObservations={finishingSessionData.initialNotes}
            onSaved={handleJournalSaved}
            onCancel={() => {
              setFinishingSessionData(null);
              setActiveTab('dashboard');
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                onStartQuest={() => setActiveTab('generator')}
                onViewJournal={() => setActiveTab('journal')}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
                onOpenEntry={(_entry) => {
                  setActiveTab('journal');
                }}
                totalQuests={totalQuests}
                totalMinutes={totalMinutes}
                recentEntries={journalEntries}
                aiStatus={aiStatus}
                categoriesExplored={categoriesExplored}
              />
            )}

            {activeTab === 'generator' && (
              <QuestGenerator
                onStartSession={handleStartSession}
              />
            )}

            {activeTab === 'session' && (
              <QuestSession
                session={activeSession}
                onFinishSession={handleFinishSession}
                onCancelSession={() => {
                  setActiveSession(null);
                  setActiveTab('dashboard');
                }}
              />
            )}

            {activeTab === 'journal' && (
              <JournalHistory
                entries={journalEntries}
                onDeleteEntry={handleDeleteEntry}
                onRefresh={fetchJournal}
                onStartQuest={() => setActiveTab('generator')}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressStats
                totalQuests={totalQuests}
                totalMinutes={totalMinutes}
                totalSessions={journalEntries.length}
                categoriesExplored={categoriesExplored}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

    </div>
  );
}
export default App;
