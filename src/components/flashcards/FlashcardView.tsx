import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VocabularyItem, FlashcardMode } from '../../types/vocabulary';
import { db, recordReviewResult } from '../../services/db';
import { CEFRBadge, POSBadge } from '../common/Badge';
import { AudioButton } from '../common/AudioButton';
import { SourceAttribution } from '../common/SourceAttribution';
import { EmptyState } from '../common/EmptyState';
import { Rating } from '../../services/srs';
import { targetPattern } from '../../services/textMatching';
import confetti from 'canvas-confetti';
import {LexicalPracticeView} from './LexicalPracticeView';
import {primaryTurkish} from '../../services/lexicalService';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  Shuffle,
} from 'lucide-react';

interface FlashcardViewProps {
  vocabulary: VocabularyItem[];
  defaultMode?: FlashcardMode;
  onSessionComplete?: () => void;
  onRefreshVocabulary: () => void;
}

export const FlashcardView:React.FC<FlashcardViewProps>=(props)=>{
 const [context,setContext]=useState(false);
 return <><nav className="flex flex-wrap gap-3 p-4" aria-label="Practice type"><button className="retro-btn-cream p-2" onClick={()=>setContext(false)}>Classic flashcards</button><button className="retro-btn-teal p-2" onClick={()=>setContext(true)}>Context & Usage Practice</button></nav>{context?<LexicalPracticeView/>:<ClassicFlashcardView {...props}/>}</>;
};
const ClassicFlashcardView: React.FC<FlashcardViewProps> = ({
  vocabulary,
  defaultMode = 'en_to_tr',
  onSessionComplete,
  onRefreshVocabulary,
}) => {
  const [selectedMode, setSelectedMode] = useState<FlashcardMode>(defaultMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [hasSubmittedTyped, setHasSubmittedTyped] = useState(false);
  const [manualOverrideStatus, setManualOverrideStatus] = useState<boolean | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [studyList, setStudyList] = useState<VocabularyItem[]>(() => [...vocabulary]);
  const ratingLock = useRef(false);
  const recallLock = useRef(false);
  const [error, setError] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);

  const currentCard = studyList[currentIndex] || null;
  const practiceExample = currentCard?.examples[exampleIndex] || currentCard?.examples[0];

  const handleShuffle = () => {
    setExampleIndex(0);
    const shuffled = [...studyList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setStudyList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setHasSubmittedTyped(false);
    setManualOverrideStatus(null);
    setCompletedCount(0);
    setStartTime(Date.now());
  };

  const resetCardState = useCallback(() => {
    setExampleIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setHasSubmittedTyped(false);
    setManualOverrideStatus(null);
    setStartTime(Date.now());
  }, []);

  const handleRate = useCallback(async (rating: Rating) => {
    if (!currentCard || ratingLock.current) return;
    ratingLock.current = true;
    setError('');
    try {
    const duration = Date.now() - startTime;
    await recordReviewResult(currentCard.id, rating, selectedMode, duration);

    setCompletedCount(count => count + 1);

    if (currentIndex + 1 >= studyList.length) {
      setCurrentIndex(studyList.length);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      await onRefreshVocabulary();
      // Do not reopen the queue with stale due counts while the final save refreshes.
      if (onSessionComplete) onSessionComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
      resetCardState();
      await onRefreshVocabulary();
    }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save this review. Please try again.'); }
    finally { ratingLock.current = false; }
  }, [currentCard, startTime, selectedMode, currentIndex, studyList.length, onSessionComplete, onRefreshVocabulary, resetCardState]);

  const isTypedCorrect = useMemo(() => {
    if (!currentCard || !hasSubmittedTyped) return false;
    if (manualOverrideStatus !== null) return manualOverrideStatus;

    const clean = (value: string) => value.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanUser = clean(typedAnswer);
    const cleanTarget = clean(currentCard.word);

    if (cleanUser === cleanTarget) return true;

    // This mode asks for the target headword, not an arbitrary synonym. Meaning
    // similarity does not establish interchangeable usage or exact recall.
    return false;
  }, [currentCard, hasSubmittedTyped, typedAnswer, manualOverrideStatus]);

  const handleTypedSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedAnswer.trim() || !currentCard || hasSubmittedTyped || recallLock.current) return;
    recallLock.current=true;
    try {
      const clean=(v:string)=>v.normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ');
      await db.recallAttempts.add({id:crypto.randomUUID(),vocabularyId:currentCard.id,timestamp:new Date().toISOString(),correct:clean(typedAnswer)===clean(currentCard.word)});
      setHasSubmittedTyped(true);setIsFlipped(true);
    } catch(error){setError(error instanceof Error?error.message:'Could not save recall attempt.');}
    finally{recallLock.current=false;}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select, button, [contenteditable="true"], [role="dialog"]')) return;
      if (e.code === 'Space' && !isFlipped) {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRate]);

  if (vocabulary.length === 0 || !currentCard) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState
          icon={Layers}
          title={completedCount ? 'Practice session complete!' : 'No cards available for practice'}
          description={completedCount ? `${completedCount} cards reviewed. Your progress has been saved.` : 'Add vocabulary items or import a vocabulary list to begin interactive flashcard practice.'}
          actionText={completedCount ? 'Practice Again' : undefined}
          onAction={handleShuffle}
        />
      </div>
    );
  }

  const renderCardFront = () => {
    switch (selectedMode) {
      case 'en_to_tr':
        return (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue-text)] font-mono">
              English Headword
            </span>
            <div className="flex items-center justify-center gap-3">
              <h2 className="vocab-word text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-[var(--color-cream)]">
                {currentCard.word}
              </h2>
              <AudioButton text={currentCard.word} size="lg" />
            </div>
            {currentCard.ipa && (
              <p className="vocab-text text-sm font-mono text-[var(--color-cream)]/70">{currentCard.ipa}</p>
            )}
            <div className="flex items-center justify-center gap-2 pt-2">
              <POSBadge pos={currentCard.partOfSpeech} />
              <CEFRBadge level={currentCard.cefrLevel} />
            </div>
          </div>
        );

      case 'tr_to_en':
        return (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue-text)] font-mono">
              Meaning → Target English Word
            </span>
            <h2 className="vocab-text text-2xl sm:text-3xl font-bold font-heading text-[var(--color-cream)] max-w-lg mx-auto leading-snug">
              {primaryTurkish(currentCard)||currentCard.englishDefinition || 'No meaning saved. Choose another mode or add a definition.'}
            </h2>
            <div className="flex items-center justify-center gap-2 pt-2">
              <POSBadge pos={currentCard.partOfSpeech} />
              <CEFRBadge level={currentCard.cefrLevel} />
            </div>
          </div>
        );

      case 'sentence_context':
        const example = practiceExample;
        const blankedSentence = example
          ? example.sentence.replace(
              targetPattern(currentCard.word),
              '_______________'
            )
          : `Recall target word: "${currentCard.englishDefinition}"`;

        return (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-orange-text)] font-mono">
              Sentence Context Recall · self-assessed, not grammar-graded
            </span>
            <p className="vocab-text text-xl font-medium text-[var(--color-cream)] max-w-xl mx-auto leading-relaxed">
              "{blankedSentence}"
            </p>
            
            <SourceAttribution credit={example?.credit} />
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <POSBadge pos={currentCard.partOfSpeech} />
              <CEFRBadge level={currentCard.cefrLevel} />
            </div>
          </div>
        );

      case 'collocation':
        const col = currentCard.collocations?.[0];
        const blankedCol = col
          ? col.collocation.replace(targetPattern(currentCard.word), '_____')
          : `Collocation for: ${currentCard.word}`;

        return (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue-text)] font-mono">
              Collocation Completion
            </span>
            <h2 className="vocab-text text-3xl font-extrabold font-heading text-[var(--color-cream)]">
              {blankedCol}
            </h2>
            
          </div>
        );

      case 'synonym_antonym':
        const synList = currentCard.synonyms?.map((s) => s.word).join(', ');
        const antList = currentCard.antonyms?.map((a) => a.word).join(', ');

        return (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Synonym & Antonym Clue Drill
            </span>
            <div className="space-y-2 max-w-md mx-auto">
              {!synList && !antList && <p className="vocab-text">{currentCard.englishDefinition || 'No synonym or antonym clues saved. Choose another mode or add clues in Word Details.'}</p>}
              {synList && (
                <div className="p-3 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)]/15">
                  <span className="text-xs text-[var(--color-blue-text)] font-bold block mb-0.5">
                    Synonyms:
                  </span>
                  <span className="vocab-text text-sm text-[var(--color-cream)] font-medium">{synList}</span>
                </div>
              )}
              {antList && (
                <div className="p-3 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)]/15">
                  <span className="text-xs text-[var(--color-orange-text)] font-bold block mb-0.5">
                    Antonyms:
                  </span>
                  <span className="vocab-text text-sm text-[var(--color-cream)] font-medium">{antList}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'typed_recall':
        return (
          <div className="text-center space-y-4 w-full max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-orange-text)] font-mono">
              Active Recall — Type the Target English Word
            </span>
            
            {currentCard.englishDefinition && (
              <p className="vocab-text text-xs text-[var(--color-cream)]/80 leading-relaxed max-w-md mx-auto">
                {currentCard.englishDefinition}
              </p>
            )}

            {!hasSubmittedTyped ? (
              <form onSubmit={handleTypedSubmit} className="space-y-3 pt-2">
                <input
                  type="text"
                  autoFocus
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type the English word here..."
                  className="vocab-text w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline)]/30 focus:border-[var(--color-blue)] rounded-none text-center text-lg font-bold text-[var(--color-cream)] placeholder-[var(--color-outline)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/30"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-[var(--color-ivory)] text-xs font-bold rounded-none shadow-[3px_3px_0px_#000] shadow-black transition-all"
                >
                  Submit Answer (Enter)
                </button>
              </form>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div className="flashcard-study p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {error && <p role="alert">{error}</p>}
      {selectedMode === 'sentence_context' && (currentCard?.examples.length || 0) > 1 && <label className="block">Practice sentence
        <select aria-label="Practice sentence" value={exampleIndex} onChange={e => { setExampleIndex(Number(e.target.value)); setIsFlipped(false); }} className="vocab-example block w-full bg-[var(--color-surface)] p-2 border border-[var(--color-pink)]">
          {currentCard.examples.map((ex, index) => <option key={ex.id} value={index}>{ex.sentence}</option>)}
        </select>
      </label>}
      {/* Top Controls: Mode Switcher & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)]">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-[var(--color-cream)] uppercase tracking-wider font-mono">
            Mode:
          </label>
          <select
            value={selectedMode}
            onChange={(e) => {
              setSelectedMode(e.target.value as FlashcardMode);
              resetCardState();
            }}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs font-semibold text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
          >
            <option value="en_to_tr">A: Word → Definition</option>
            <option value="tr_to_en">B: Definition → Word</option>
            <option value="sentence_context">C: Sentence Context Fill</option>
            <option value="collocation">D: Collocation Completion</option>
            <option value="synonym_antonym">E: Synonym & Antonym Clues</option>
            <option value="typed_recall">F: Typed Active Recall</option>
          </select>
        </div>

        {/* Counter & Shuffle */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="font-bold text-[var(--color-cream)]/80">
            Card {currentIndex + 1} / {studyList.length}
          </span>
          <div className="w-24 bg-[var(--color-surface)] rounded-full h-2 overflow-hidden border border-[var(--color-outline)]">
            <div
              className="bg-[var(--color-blue)] h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + 1) / studyList.length) * 100}%`,
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            title="Shuffle deck"
            className="p-1.5 text-[var(--color-cream)]/70 hover:text-[var(--color-cream)] hover:bg-[var(--color-black)] rounded-none transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container (Warm cream reading surface) */}
      <div className="relative min-h-[380px] flex flex-col justify-between p-4 sm:p-8 rounded-none bg-[var(--color-surface)] text-[var(--color-cream)] border border-[var(--color-orange)]/30 shadow-[3px_3px_0px_#000]">
        <div className="flex-1 flex flex-col justify-center items-center py-4">
          {!isFlipped ? (
            renderCardFront()
          ) : (
            <div className="w-full space-y-6 text-center animate-fadeIn">
              {/* If in typed mode, show user evaluation */}
              {selectedMode === 'typed_recall' && (
                <div
                  className={`p-3.5 rounded-none border flex items-center justify-between gap-4 max-w-md mx-auto ${
                    isTypedCorrect
                      ? 'bg-[var(--color-green)]/15 text-[var(--color-green)] border-[var(--color-green)]'
                      : 'bg-[var(--color-black)] text-[var(--color-pink-text)] border-[var(--color-pink)]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {isTypedCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-green)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[var(--color-orange-text)]" />
                    )}
                    <span>
                      {isTypedCorrect ? 'Correct Recall!' : `You typed: "${typedAnswer}"`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setManualOverrideStatus(true)}
                      className="px-2 py-1 bg-[var(--color-blue)] text-[var(--color-cream)] rounded-none text-[11px] font-bold"
                    >
                      I was right
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualOverrideStatus(false)}
                      className="px-2 py-1 bg-[var(--color-black)] text-[var(--color-cream)] rounded-none text-[11px] font-bold"
                    >
                      I was wrong
                    </button>
                  </div>
                </div>
              )}

              {/* Revealed Headword */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="vocab-word text-4xl font-extrabold font-heading text-[var(--color-cream)] tracking-tight">
                    {currentCard.word}
                  </h2>
                  <AudioButton text={currentCard.word} size="md" />
                </div>
                {currentCard.ipa && (
                  <p className="vocab-text text-sm font-mono text-[var(--color-cream)]/70">{currentCard.ipa}</p>
                )}
              </div>

              {/* Meanings */}
              <div className="grid grid-cols-1 gap-3 text-left max-w-xl mx-auto">
                {primaryTurkish(currentCard)&&<div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-outline)]"><span>Turkish meaning · saved/local source</span><p className="vocab-text">{primaryTurkish(currentCard)}</p></div>}
                <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-outline)]/15 rounded-none">
                  <span className="text-[11px] font-bold text-[var(--color-blue-text)] uppercase tracking-wider font-mono">
                    English Definition
                  </span>
                  <p className="vocab-text text-xs font-semibold text-[var(--color-cream)] mt-0.5 leading-relaxed">
                    {currentCard.englishDefinition || '—'}
                  </p>
                </div>
              </div>

              {/* Example */}
              {practiceExample && (
                <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-outline)]/10 rounded-none max-w-xl mx-auto text-left space-y-1">
                  <p className="vocab-example text-xs font-bold text-[var(--color-cream)]">
                    "{practiceExample.sentence}"
                  </p>
                  
                  <SourceAttribution credit={practiceExample.credit} />
                  
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions: Flip vs SM-2 Rating Buttons */}
        <div className="pt-6 border-t border-[var(--color-outline)]/15">
          {!isFlipped ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="inline-flex items-center gap-2 px-8 py-3 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-none transition-all shadow-[3px_3px_0px_#000] shadow-black"
              >
                <RotateCw className="w-4 h-4 text-[var(--color-ivory)]" />
                <span>Reveal Answer (Space)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-xs font-bold text-[var(--color-cream)]/70 font-mono">
                Rate your active recall difficulty:
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => handleRate('again')}
                  className="p-3 rounded-none bg-[var(--color-pink)] text-center transition-all border-2 border-black"
                >
                  <span className="text-xs font-bold block">Again</span>
                  <span className="text-[10px] text-[var(--color-orange-text)] font-mono block">&lt; 1 day [1]</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('hard')}
                  className="p-3 rounded-none bg-[var(--color-orange)] text-center transition-all border-2 border-black"
                >
                  <span className="text-xs font-bold block">Hard</span>
                  <span className="text-[10px] text-[var(--color-cream)]/70 font-mono block">1-2 days [2]</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('good')}
                  className="p-3 rounded-none bg-[var(--color-yellow)] text-center transition-all border-2 border-black"
                >
                  <span className="text-xs font-bold block">Good</span>
                  <span className="text-[10px] text-[var(--color-cream)] font-mono block">3-6 days [3]</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('easy')}
                  className="p-3 rounded-none bg-[var(--color-green)] text-center transition-all border-2 border-black"
                >
                  <span className="text-xs font-bold block">Easy</span>
                  <span className="text-[10px] text-[var(--color-ivory)]/90 font-mono block">7+ days [4]</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
