import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { VocabularyItem } from './types/vocabulary';
import {
  initDatabase,
  getAllVocabulary,
  addVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getTodayActivityStats,
  resetWithSeedData,
  TodayActivityStats,
  getSettings,
  DEFAULT_SETTINGS,
} from './services/db';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
const OpenEndedLearningView = lazy(() => import('./components/daily/OpenEndedLearningView').then(m => ({default: m.OpenEndedLearningView})));
const FlashcardView = lazy(() => import('./components/flashcards/FlashcardView').then(m => ({default: m.FlashcardView})));
const WritingPracticeView = lazy(() => import('./components/writing/WritingPracticeView').then(m => ({default: m.WritingPracticeView})));
const LibraryView = lazy(() => import('./components/library/LibraryView').then(m => ({default: m.LibraryView})));
const ReviewCenterView = lazy(() => import('./components/review/ReviewCenterView').then(m => ({default: m.ReviewCenterView})));
const ImportView = lazy(() => import('./components/import/ImportView').then(m => ({default: m.ImportView})));
const StatisticsView = lazy(() => import('./components/statistics/StatisticsView').then(m => ({default: m.StatisticsView})));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({default: m.SettingsView})));
import { VocabularyDetailModal } from './components/library/VocabularyDetailModal';
import { VocabularyEditModal } from './components/library/VocabularyEditModal';
import { isItemDue } from './services/srs';
const ReadingView = lazy(() => import('./components/reading/ReadingView').then(m => ({default: m.ReadingView})));
const GrammarView = lazy(() => import('./components/grammar/GrammarView').then(m => ({default:m.GrammarView})));
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StorageControls } from './components/layout/StorageControls';
import { initializeLocalPersistence, startAutoBackup, stopAutoBackup } from './services/localPersistence';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [todayStats, setTodayStats] = useState<TodayActivityStats>({
    wordsLearnedToday: 0,
    wordsReviewedToday: 0,
    wordsDueToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Modals state
  const [detailItem, setDetailItem] = useState<VocabularyItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<VocabularyItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Load and refresh state from local IndexedDB
  const refreshData = useCallback(async () => {
    // Local dataset only; missing lexical coverage never blocks the existing app.
    await import('./services/lexicalService').then(m=>m.enrichSavedVocabulary()).catch(()=>{});
    const allVocab = await getAllVocabulary();
    const [stats, preferences] = await Promise.all([getTodayActivityStats(allVocab), getSettings()]);

    setVocabulary(allVocab);
    setTodayStats(stats);
    setSettings(preferences);
    setDetailItem(current => current ? allVocab.find(v => v.id === current.id) || current : null);
  }, []);

  // Initial database hydration
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
      await initializeLocalPersistence();
      await initDatabase();
      await refreshData();
      startAutoBackup();
      } catch (error) { setLoadError(error instanceof Error ? error.message : 'Unable to open local storage.'); }
      finally { setIsLoading(false); }
    };
    initialize();
    return stopAutoBackup;
  }, [refreshData]);

  // CRUD actions
  const handleSaveWord = async (item: VocabularyItem) => {
    const existing = vocabulary.find((v) => v.id === item.id);
    if (existing) {
      await updateVocabulary(item.id, item);
    } else {
      await addVocabulary(item);
    }
    await refreshData();
  };

  const handleDeleteWord = async (id: string) => {
    await deleteVocabulary(id);
    await refreshData();
    if (detailItem?.id === id) {
      setIsDetailOpen(false);
      setDetailItem(null);
    }
  };

  const handleOpenDetail = (item: VocabularyItem) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (item?: VocabularyItem) => {
    setEditItem(item || null);
    setIsEditOpen(true);
  };

  const handleResetSeedData = async () => {
    await resetWithSeedData();
    await refreshData();
  };

  const dueCount = vocabulary.filter((v) => isItemDue(v.srs)).length;

  return (
    <div className="retro-shell flex min-h-screen bg-[var(--color-black)] text-[var(--color-cream)] font-sans antialiased selection:bg-[var(--color-orange)] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        dueCount={dueCount}
        totalCount={vocabulary.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          activeTab={activeTab}
          onOpenAddModal={() => handleOpenEdit()}
          learnedTodayCount={todayStats.wordsLearnedToday}
        />

        <StorageControls hasOpenForm={isEditOpen || isDetailOpen} />
        <main className="flex-1 pb-16">
          {loadError && <div role="alert" className="p-6">Local storage could not be loaded: {loadError}. Please reload to retry; your data has not been reset.</div>}
          {isLoading ? (
            <div className="flex items-center justify-center p-24 text-xs font-mono text-[var(--color-cream)]/50">
              Initializing EnglishByDevotion local database...
            </div>
          ) : (
            <ErrorBoundary key={activeTab}><Suspense fallback={<div className="p-6">Loading screen…</div>}>
              {activeTab === 'grammar' && <GrammarView />}
              {activeTab === 'dashboard' && (
                <DashboardView
                  vocabulary={vocabulary}
                  learnedTodayCount={todayStats.wordsLearnedToday}
                  reviewedTodayCount={todayStats.wordsReviewedToday}
                  onNavigate={setActiveTab}
                  onOpenDetail={handleOpenDetail}
                  onOpenAddModal={() => handleOpenEdit()}
                  onResetSeedData={handleResetSeedData}
                />
              )}

              {activeTab === 'daily' && (
                <OpenEndedLearningView
                  vocabulary={vocabulary}
                  onRefresh={refreshData}
                  onOpenImport={() => setActiveTab('import')}
                  onOpenDetail={handleOpenDetail}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardView
                  vocabulary={vocabulary}
                  defaultMode={settings.defaultFlashcardMode}
                  onRefreshVocabulary={refreshData}
                />
              )}

              {activeTab === 'writing' && (
                <WritingPracticeView
                  vocabulary={vocabulary}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === 'library' && (
                <LibraryView
                  vocabulary={vocabulary}
                  onOpenDetail={handleOpenDetail}
                  onOpenAddModal={() => handleOpenEdit()}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === 'review' && (
                <ReviewCenterView
                  vocabulary={vocabulary}
                  onOpenDetail={handleOpenDetail}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === 'reading' && <ReadingView onOpenDetail={handleOpenDetail} onRefresh={refreshData} />}

              {activeTab === 'import' && (
                <ImportView
                  vocabulary={vocabulary}
                  onImportComplete={refreshData}
                />
              )}

              {activeTab === 'statistics' && (
                <StatisticsView vocabulary={vocabulary} />
              )}

              {activeTab === 'settings' && (
                <SettingsView onRefresh={refreshData} />
              )}
            </Suspense></ErrorBoundary>
          )}
        </main>
      </div>

      {/* Vocabulary Detail Modal */}
      <VocabularyDetailModal
        key={detailItem?.id || 'closed'}
        item={detailItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        onEdit={(item) => {
          setIsDetailOpen(false);
          handleOpenEdit(item);
        }}
        onDelete={handleDeleteWord}
        onItemUpdated={refreshData}
      />

      {/* Vocabulary Edit / Add Modal */}
      <VocabularyEditModal
        item={editItem}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveWord}
      />
    </div>
  );
}

export default App;
