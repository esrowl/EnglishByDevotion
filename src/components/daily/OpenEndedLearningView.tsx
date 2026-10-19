import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { markWordLearned } from '../../services/db';
import { isItemDue } from '../../services/srs';
import { CEFRBadge, POSBadge } from '../common/Badge';
import { AudioButton } from '../common/AudioButton';
import { EmptyState } from '../common/EmptyState';
import { FlashcardView } from '../flashcards/FlashcardView';
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {nextDiscoveryWord,recordDiscoveryFeedback,getDiscoveryPreferences,setDiscoveryPreference} from '../../services/advancedDiscovery';
import type {DiscoveryFeedback,DiscoveryPreferences,DiscoveryWord} from '../../types/discovery';
import {LexicalContent} from '../library/LexicalContent';
import {LexicalTools} from '../library/LexicalTools';

interface OpenEndedLearningViewProps {
  vocabulary: VocabularyItem[];
  onRefresh: () => void;
  onOpenImport: () => void;
  onOpenDetail: (item: VocabularyItem) => void;
}

export const OpenEndedLearningView: React.FC<OpenEndedLearningViewProps> = ({
  vocabulary,
  onRefresh,
  onOpenImport,
  onOpenDetail,
}) => {
  const [studiedWordIdsThisSession, setStudiedWordIdsThisSession] = useState<string[]>([]);
  const [activeSubMode, setActiveSubMode] = useState<'discover' | 'saved' | 'flashcards'>('discover');
  const [discovery,setDiscovery]=useState<{entry:DiscoveryWord;item:VocabularyItem}|null>(null);
  const [busy,setBusy]=useState(false);
  const [encountered,setEncountered]=useState(0);
  const [preference,setPreference]=useState<DiscoveryPreferences['preference']>('balanced');
  const fetching=useRef(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const marking = useRef(false);
  const [error, setError] = useState('');

  // Filter unstudied 'new' words first, followed by learning items
  const availableStudyDeck = useMemo(() => {
    const newItems = vocabulary.filter((v) => v.learningStatus === 'new');
    const learningItems = vocabulary.filter((v) => v.learningStatus !== 'new' && (v.learningStatus === 'learning' || isItemDue(v.srs)));
    const all = [...newItems, ...learningItems];

    return all.filter((v) => !studiedWordIdsThisSession.includes(v.id));
  }, [vocabulary, studiedWordIdsThisSession]);

  const currentWord = activeSubMode==='discover'?discovery?.item||null:availableStudyDeck[currentWordIndex] || availableStudyDeck[0] || null;
  const loadDiscovery=async()=>{
    if(fetching.current)return;fetching.current=true;setBusy(true);setError('');setDiscovery(null);
    try{const p=await getDiscoveryPreferences();setPreference(p.preference);const next=await nextDiscoveryWord();setDiscovery(next);if(next)setEncountered(n=>n+1);}
    catch(error){setError(error instanceof Error?error.message:'Could not load discovery.');}
    finally{fetching.current=false;setBusy(false);}
  };
  useEffect(()=>{void Promise.resolve().then(loadDiscovery);},[]);
  const handleFeedback=async(feedback:DiscoveryFeedback)=>{
    if(!discovery||marking.current||busy)return;marking.current=true;setBusy(true);setError('');
    try{await recordDiscoveryFeedback(discovery.entry.key,feedback,discovery.item.dictionaryData?.source||'dictionaryapi',discovery.item.dictionaryData);if(feedback==='learning')await onRefresh();await loadDiscovery();}
    catch(error){setError(error instanceof Error?error.message:'Could not save feedback.');}
    finally{marking.current=false;setBusy(false);}
  };

  // Retained personal-library study action; NGSL discovery uses distinct feedback.
  const handleMarkLearnedAndNext = async () => {
    if (!currentWord || marking.current) return;
    marking.current = true; setError('');
    try {
    await markWordLearned(currentWord.id);
    const newStudied = [...studiedWordIdsThisSession, currentWord.id];
    setStudiedWordIdsThisSession(newStudied);
    setCurrentWordIndex(0);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });

    await onRefresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save learning progress.'); }
    finally { marking.current = false; }
  };

  const handleSkipOrNext = () => {
    if (currentWordIndex + 1 < availableStudyDeck.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setStudiedWordIdsThisSession(ids=>[...ids,currentWord!.id]);setCurrentWordIndex(0);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {error && <div role="alert"><p>{error}</p>{activeSubMode==='discover'&&!busy&&<button type="button" className="retro-btn-teal px-4 py-2" onClick={()=>void loadDiscovery()}>Retry discovery</button>}</div>}
      {/* Top Open-Ended Mode Selector (90s Retro Bar) */}
      <div className="p-3 bg-[var(--color-surface)] border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_#000]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubMode('discover')}
            className={`px-3.5 py-2 text-xs font-pixel transition-all cursor-pointer ${
              activeSubMode === 'discover'
                ? 'bg-[var(--color-orange)] text-[var(--color-cream)] border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-[var(--color-cream)] hover:bg-[var(--color-black)] border-2 border-transparent hover:border-black'
            }`}
          >
            <span>✦ DISCOVER & STUDY</span>
          </button>

          <button type="button" onClick={()=>setActiveSubMode('saved')} className={`px-3.5 py-2 text-xs font-pixel cursor-pointer ${activeSubMode==='saved'?'bg-[var(--color-blue)] text-[var(--color-cream)]':'text-[var(--color-cream)]'}`}>MY SAVED WORDS</button>

          <button
            type="button"
            onClick={() => setActiveSubMode('flashcards')}
            className={`px-3.5 py-2 text-xs font-pixel transition-all cursor-pointer ${
              activeSubMode === 'flashcards'
                ? 'bg-[var(--color-blue)] text-[var(--color-cream)] border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-[var(--color-cream)] hover:bg-[var(--color-black)] border-2 border-transparent hover:border-black'
            }`}
          >
            <span>FLASHCARD DRILL</span>
          </button>

        </div>

        {/* Session Progress Counter */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-cream)]">
          <span>SESSION:</span>
          <span className="font-bold text-[var(--color-cream)] font-pixel px-2 py-0.5 bg-[var(--color-blue)] border border-black text-[10px]">
            {activeSubMode==='discover'?`${encountered} ENCOUNTERED`:`${studiedWordIdsThisSession.length} STUDIED`}
          </span>
        </div>
      </div>

      {/* Sub Mode 1: In-depth Word Discovery */}
      {activeSubMode==='discover'&&<div className="flex flex-wrap items-center gap-3"><label>Frequency preference <select aria-label="Frequency preference" value={preference} disabled={busy} onChange={async e=>{const value=e.target.value as DiscoveryPreferences['preference'];try{await setDiscoveryPreference(value);setPreference(value);}catch(error){setError(String(error));}}}><option value="balanced">Balanced</option><option value="gentler">More frequent</option><option value="rarer">Less frequent</option></select></label><p>NGSL core excluded · Frequency is not difficulty or CEFR. Changes apply to the next word.</p></div>}
      {activeSubMode==='discover'&&busy&&!currentWord&&<p role="status">Finding an unseen word with verified dictionary data…</p>}
      <LexicalTools onRefresh={onRefresh}/>
      {activeSubMode==='discover'&&!busy&&!error&&!currentWord&&<EmptyState icon={CheckCircle2} title="No unseen prepared words remain" description="The local dictionary subset is exhausted, not the full NGSL list or a daily limit. Import a larger prepared lexical pack above. Saved words and flashcards remain available." />}
      {activeSubMode === 'saved' && !currentWord && <EmptyState icon={CheckCircle2} title="Study session complete" description="All available saved words have been studied. Advanced discovery and Flashcard Drill remain available." actionText="Import Vocabulary" onAction={onOpenImport} />}
      {activeSubMode !== 'flashcards' && currentWord && (
        <div className="space-y-6">
          {/* Main Reading Card (Warm Cream Retro Window) */}
          <div className="retro-window-purple bg-[var(--color-surface)] text-[var(--color-cream)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Window Title Strip */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-black/15 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="vocab-word text-3xl sm:text-4xl font-extrabold font-pixel text-[var(--color-cream)] tracking-tight">
                    {currentWord.word}
                  </h2>
                  {currentWord.ipa && (
                    <span className="vocab-text text-sm font-mono text-[var(--color-cream)]/70">{currentWord.ipa}</span>
                  )}
                  <AudioButton text={currentWord.word} size="md" />
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <POSBadge pos={currentWord.partOfSpeech} />
                  <CEFRBadge level={currentWord.cefrLevel} />
                  {activeSubMode==='discover'&&<span>SFI frequency rank: {discovery?.entry.rank}</span>}
                  <span className="text-xs text-[var(--color-blue-text)] font-pixel bg-black px-2 py-0.5">
                    {currentWord.topicCategories?.[0] || 'GENERAL'}
                  </span>
                </div>
              </div>

              {activeSubMode==='saved'&&<button
                type="button"
                onClick={() => onOpenDetail(currentWord)}
                className="text-xs font-bold font-pixel text-[var(--color-pink-text)] hover:text-[var(--color-cream)] flex items-center gap-1 cursor-pointer"
              >
                <span>[DETAIL]</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>}
            </div>

            <LexicalContent key={currentWord.word} item={currentWord}/>
            {activeSubMode==='discover'&&<a href="https://github.com/kami-mura/ngsl-wordlists" target="_blank" rel="noreferrer" className="underline">NGSL · Browne, Culligan & Phillips · CC BY-SA 4.0</a>}

            {/* Meanings */}
            <div className="grid grid-cols-1 gap-4">
              

              <div className="p-4 bg-[var(--color-surface)] border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                <span className="text-[10px] font-bold font-pixel uppercase tracking-wider text-[var(--color-blue-text)]">
                  English Definition
                </span>
                <p className="vocab-text text-sm font-medium text-[var(--color-cream)] leading-relaxed">
                  {currentWord.englishDefinition || '—'}
                </p>
              </div>
            </div>

            {/* Collocations */}
            {currentWord.collocations && currentWord.collocations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-pixel uppercase tracking-wider text-[var(--color-cream)] block">
                  Natural Collocations & Phrases
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentWord.collocations.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[var(--color-surface)] border-2 border-black flex items-center justify-between text-xs"
                    >
                      <span className="vocab-text font-bold text-[var(--color-cream)]">{col.collocation}</span>
                      
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {currentWord.examples && currentWord.examples.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-pixel uppercase tracking-wider text-[var(--color-cream)] block">
                  Example Sentences
                </span>
                <div className="space-y-2">
                  {currentWord.examples.map((ex, i) => (
                    <div
                      key={ex.id || i}
                      className="p-3 bg-[var(--color-surface)] border-2 border-black flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="vocab-example text-sm font-semibold text-[var(--color-cream)] leading-relaxed">
                          "{ex.sentence}"
                        </p>
                        {ex.translation&&<p className="vocab-example">{ex.translation}</p>}
                        
                      </div>
                      <AudioButton text={ex.sentence} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining in Queue */}
            <div className="pt-2 border-t-2 border-black/15 flex items-center justify-between text-[11px] font-mono text-[var(--color-cream)]/70">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-orange-text)]" />
                Continuous study active — learn as many as you wish.
              </span>
              <span className="font-bold text-[var(--color-cream)] font-pixel text-[10px]">
                {activeSubMode==='discover'?'UNSEEN NGSL POOL':`${availableStudyDeck.length} REMAINING`}
              </span>
            </div>
          </div>

          {/* Open-Ended Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--color-surface)] border-2 border-black shadow-[3px_3px_0px_#000]">
            {activeSubMode==='discover'?<><button type="button" disabled={busy} onClick={()=>void handleFeedback('familiar')} className="retro-btn-teal px-5 py-2.5">ALREADY KNOW</button><button type="button" disabled={busy} onClick={()=>void handleFeedback('learning')} className="retro-btn-teal px-5 py-2.5">LEARN THIS WORD</button><button type="button" disabled={busy} onClick={()=>void handleFeedback('skipped')} className="retro-btn-teal px-5 py-2.5">NEXT WORD</button></>:<>
            <button
              type="button"
              onClick={handleSkipOrNext}
              className="text-xs font-pixel text-[var(--color-cream)] hover:text-[var(--color-orange-text)] cursor-pointer"
            >
              SKIP WORD →
            </button>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleMarkLearnedAndNext}
                className="retro-btn-teal px-5 py-2.5 text-[10px] rounded-none flex items-center gap-1.5 cursor-pointer font-bold uppercase"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LEARNED! NEXT WORD</span>
              </button>
            </div>
            </>}
          </div>
          {activeSubMode==='discover'&&<p>Already Know records claimed familiarity, not mastery. Learn This Word saves for active learning; Next Word only skips.</p>}
        </div>
      )}

      {/* Sub Mode 2: Flashcards */}
      {activeSubMode === 'flashcards' && (
        <FlashcardView
          vocabulary={vocabulary}
          onRefreshVocabulary={onRefresh}
        />
      )}

    </div>
  );
};
