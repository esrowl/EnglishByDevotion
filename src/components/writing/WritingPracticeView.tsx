import React, { useState } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { db, getVocabularyById, updateVocabulary } from '../../services/db';
import { containsTarget } from '../../services/textMatching';
import { CEFRBadge, POSBadge } from '../common/Badge';
import { AudioButton } from '../common/AudioButton';
import {
  PenLine,
  CheckCircle2,
  Save,
} from 'lucide-react';

interface WritingPracticeViewProps {
  vocabulary: VocabularyItem[];
  initialWordId?: string;
  onRefresh: () => void;
  onFinish?: () => void;
}

export const WritingPracticeView: React.FC<WritingPracticeViewProps> = ({
  vocabulary,
  initialWordId,
  onRefresh,
  onFinish,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialWordId || vocabulary[0]?.id || ''
  );
  const [userSentence, setUserSentence] = useState('');
  const translationTr = '';
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedItem = vocabulary.find((v) => v.id === selectedId) || vocabulary[0];

  if (!selectedItem) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-cream)]/70">
        No vocabulary available for writing practice. Add words to begin.
      </div>
    );
  }

  // Verification checks
  const containsTargetWord = containsTarget(userSentence, selectedItem.word);

  const matchedCollocations = selectedItem.collocations?.filter((c) =>
    userSentence.toLowerCase().includes(c.collocation.toLowerCase())
  ) || [];

  const wordCount = userSentence.trim() ? userSentence.trim().split(/\s+/).length : 0;

  const handleSaveToCard = async () => {
    if (!userSentence.trim() || saving) return;
    setSaving(true); setError('');
    try {

    const newExample = {
      id: `user-ex-${Date.now()}`,
      sentence: userSentence.trim(),
      translation: translationTr.trim() || undefined,
      highlightedTarget: selectedItem.word,
    };

    await db.transaction('rw', db.vocabulary, async () => {
      const current = await getVocabularyById(selectedItem.id);
      if (!current) throw new Error('This word no longer exists.');
      if (!current.examples.some(e => e.sentence === newExample.sentence)) await updateVocabulary(current.id, {examples: [...current.examples, newExample]});
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
    onRefresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save sentence.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {error && <p role="alert">{error}</p>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-cream)] font-heading flex items-center gap-2">
            <PenLine className="w-5 h-5 text-[var(--color-orange-text)]" />
            Personal Writing Notes · ungraded
          </h2>
          <p className="text-xs text-[var(--color-cream)]/70 mt-0.5">
            Keep your own examples. This notebook does not evaluate grammar, meaning or appropriate vocabulary usage. Use Grammar for checked exercises.
          </p>
        </div>

        {/* Word Selector */}
        <select
          value={selectedItem.id}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setUserSentence('');
                  }}
          className="vocab-related px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] text-xs font-semibold text-[var(--color-cream)] rounded-none focus:outline-none focus:border-[var(--color-blue)]"
        >
          {vocabulary.map((v) => (
            <option key={v.id} value={v.id}>
              {v.word}
            </option>
          ))}
        </select>
      </div>

      {/* Target Word Reference Card (Warm Cream surface for reading clarity) */}
      <div className="p-6 rounded-none bg-[var(--color-surface)] text-[var(--color-cream)] shadow-[3px_3px_0px_#000] border border-[var(--color-orange)]/30 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="vocab-word text-2xl font-bold font-heading text-[var(--color-cream)]">
                {selectedItem.word}
              </h3>
              {selectedItem.ipa && (
                <span className="vocab-text text-xs font-mono text-[var(--color-cream)]/70">{selectedItem.ipa}</span>
              )}
              <AudioButton text={selectedItem.word} size="sm" />
              <POSBadge pos={selectedItem.partOfSpeech} />
              <CEFRBadge level={selectedItem.cefrLevel} />
            </div>
            <p className="vocab-text text-sm font-semibold text-[var(--color-cream)]">
              {selectedItem.englishDefinition}
            </p>
          </div>

          <div className="text-right text-xs text-[var(--color-cream)]/80 font-mono hidden sm:block">
            Target Focus
          </div>
        </div>

        {selectedItem.englishDefinition && (
          <p className="vocab-text text-xs text-[var(--color-cream)] leading-relaxed border-t border-[var(--color-outline)]/15 pt-2">
            {selectedItem.englishDefinition}
          </p>
        )}

        {/* Collocation suggestions */}
        {selectedItem.collocations && selectedItem.collocations.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="font-semibold text-[var(--color-blue-text)] text-[11px] uppercase tracking-wider">
              Try using these collocations:
            </span>
            {selectedItem.collocations.map((c, i) => (
              <span
                key={i}
                className="vocab-related px-2 py-0.5 rounded-none bg-[var(--color-black)]/10 text-[var(--color-cream)] font-medium border border-[var(--color-outline)]/20 text-[11px]"
              >
                {c.collocation}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Writing Studio Input */}
      <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] flex items-center justify-between">
            <span>Compose Your Original English Sentence</span>
            <span className="font-mono text-[11px] text-[var(--color-cream)]/70">
              {wordCount} words
            </span>
          </label>
          <textarea
            rows={3}
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder={`Write a natural, complete sentence containing "${selectedItem.word}"...`}
            className="vocab-example w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-sm text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)] focus:ring-1 focus:ring-[var(--color-blue)]/30 leading-relaxed font-sans"
          />
        </div>

        

        {/* Real-time Feedback Pills */}
        <div className="flex items-center gap-3 pt-2 text-xs flex-wrap">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
              containsTargetWord
                ? 'bg-[var(--color-blue)]/40 text-[var(--color-blue-text)] border-[var(--color-blue)]/50'
                : 'bg-[var(--color-black)]/40 text-[var(--color-cream)]/70 border-[var(--color-outline)]'
            }`}
          >
            <span>{containsTargetWord?'Literal target text found':'Literal target text not found'} · not a grammar check</span>
          </div>

          {matchedCollocations.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-blue)]/40 text-[var(--color-cream)] border border-[var(--color-blue)]/50 text-xs font-medium">
              <span>
                Literal text match only, usage not checked: {matchedCollocations.map((c) => c.collocation).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-outline)]">
          {isSaved ? (
            <span className="text-xs text-[var(--color-blue-text)] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Sentence saved to your vocabulary record!
            </span>
          ) : (
            <span className="text-xs text-[var(--color-cream)]/70">
              Saving will add this sentence permanently to your card.
            </span>
          )}

          <div className="flex items-center gap-2">
            {onFinish && (
              <button
                type="button"
                onClick={onFinish}
                className="px-4 py-2 text-xs font-medium text-[var(--color-cream)]/70 hover:text-[var(--color-cream)] bg-[var(--color-surface)] rounded-none transition-colors"
              >
                Finish for Now
              </button>
            )}

            <button
              type="button"
              disabled={!containsTargetWord || saving}
              onClick={handleSaveToCard}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-none transition-all shadow-[3px_3px_0px_#000] ${
                containsTargetWord
                  ? 'bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-[var(--color-ivory)] shadow-black'
                  : 'bg-[var(--color-black)] text-[var(--color-cream)]/70 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save to Vocabulary Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
