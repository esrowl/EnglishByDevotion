import React, { useState, useMemo } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { isItemDue } from '../../services/srs';
import { POSBadge, CEFRBadge } from '../common/Badge';
import { FlashcardView } from '../flashcards/FlashcardView';
import { EmptyState } from '../common/EmptyState';
import { RotateCcw, Clock, CheckCircle2, Play } from 'lucide-react';

interface ReviewCenterViewProps {
  vocabulary: VocabularyItem[];
  onOpenDetail: (item: VocabularyItem) => void;
  onRefresh: () => void;
}

export const ReviewCenterView: React.FC<ReviewCenterViewProps> = ({
  vocabulary,
  onOpenDetail,
  onRefresh,
}) => {
  const [isReviewingNow, setIsReviewingNow] = useState(false);
  const [sessionDeck, setSessionDeck] = useState<VocabularyItem[]>([]);
  const [filterDifficultOnly, setFilterDifficultOnly] = useState(false);

  const dueItems = useMemo(() => {
    return vocabulary.filter((v) => {
      const due = isItemDue(v.srs);
      if (!due) return false;
      if (filterDifficultOnly && !v.isDifficult && v.srs.lapses === 0) return false;
      return true;
    });
  }, [vocabulary, filterDifficultOnly]);

  const upcomingItems = useMemo(() => {
    return vocabulary
      .filter((v) => !isItemDue(v.srs))
      .sort((a, b) => (a.srs.nextReviewDate || '').localeCompare(b.srs.nextReviewDate || ''))
      .slice(0, 8);
  }, [vocabulary]);

  if (isReviewingNow && sessionDeck.length > 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsReviewingNow(false)}
            className="text-xs font-semibold text-[var(--color-cream)]/70 hover:text-[var(--color-cream)]"
          >
            ← Exit Review Session
          </button>
          <span className="text-xs font-mono text-[var(--color-blue-text)]">
            {dueItems.length} Due Cards in Queue
          </span>
        </div>
        <FlashcardView
          vocabulary={sessionDeck}
          onRefreshVocabulary={onRefresh}
          onSessionComplete={() => setIsReviewingNow(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[3px_3px_0px_#000]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-none bg-[var(--color-black)] text-[var(--color-orange-text)] border border-[var(--color-orange)]/40 font-mono">
              Spaced Repetition Queue
            </span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-[var(--color-cream)]">
            {dueItems.length > 0
              ? `${dueItems.length} Words Ready for Review Today`
              : 'All Reviews Complete for Today!'}
          </h2>
          <p className="text-xs text-[var(--color-cream)]/70 max-w-xl">
            Calculated based on the Ebbinghaus forgetting curve to strengthen synaptic retention at optimal intervals.
          </p>
        </div>

        {dueItems.length > 0 ? (
          <button
            type="button"
            onClick={() => { setSessionDeck([...dueItems]); setIsReviewingNow(true); }}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-none transition-all shadow-[3px_3px_0px_#000] shadow-black border border-[var(--color-orange)]/50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Review Session</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--color-blue)]/40 border border-[var(--color-blue)]/60 text-[var(--color-blue-text)] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Memory Queue Clear</span>
          </div>
        )}
      </div>

      {/* Due Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] font-heading flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[var(--color-blue-text)]" />
            Due Vocabulary Cards ({dueItems.length})
          </h3>

          <button
            type="button"
            onClick={() => setFilterDifficultOnly(!filterDifficultOnly)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-none border transition-colors ${
              filterDifficultOnly
                ? 'bg-[var(--color-black)] text-[var(--color-orange-text)] border-[var(--color-orange)]'
                : 'bg-[var(--color-surface)] text-[var(--color-cream)]/70 border-[var(--color-outline)] hover:text-[var(--color-cream)]'
            }`}
          >
            Filter Difficult Words Only
          </button>
        </div>

        {dueItems.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No cards currently due for review"
            description="All your vocabulary records are within their retention intervals. Check back tomorrow or practice in the Flashcards section."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenDetail(item)}
                className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] hover:border-[var(--color-orange)]/50 hover:bg-[var(--color-surface)] cursor-pointer transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="vocab-word font-bold text-[var(--color-cream)] text-sm">{item.word}</h4>
                    <span className="vocab-text text-xs text-[var(--color-cream)]/70 ">
                      {item.englishDefinition}
                    </span>
                  </div>
                  <POSBadge pos={item.partOfSpeech} />
                </div>

                <div className="pt-2 border-t border-[var(--color-outline)] flex items-center justify-between text-[11px] text-[var(--color-cream)]/70 font-mono">
                  <span>Interval: {item.srs.interval}d</span>
                  <span className="text-[var(--color-orange-text)] font-semibold">Due Today</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Schedule */}
      {upcomingItems.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--color-outline)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)]/80 font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-blue-text)]" />
            Upcoming Scheduled Reviews
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenDetail(item)}
                className="p-3 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] cursor-pointer hover:border-[var(--color-blue)] transition-all text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="vocab-related font-semibold text-[var(--color-cream)]">{item.word}</span>
                  <CEFRBadge level={item.cefrLevel} />
                </div>
                <div className="text-[11px] text-[var(--color-cream)]/70 font-mono">
                  Due: {item.srs.nextReviewDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
