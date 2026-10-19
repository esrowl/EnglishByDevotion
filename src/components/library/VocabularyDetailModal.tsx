import React, { useState } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { Modal } from '../common/Modal';
import { CEFRBadge, POSBadge, StatusBadge, ProvenanceBadge } from '../common/Badge';
import { AudioButton } from '../common/AudioButton';
import {
  Star,
  AlertTriangle,
  BookMarked,
  Layers,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';
import { toggleFavorite, toggleDifficult, updateVocabulary } from '../../services/db';
import { ExternalWordContent } from './ExternalWordContent';
import { SourceAttribution } from '../common/SourceAttribution';
import {LexicalContent} from './LexicalContent';

interface VocabularyDetailModalProps {
  item: VocabularyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: VocabularyItem) => void;
  onDelete: (id: string) => Promise<void>;
  onItemUpdated: () => void;
}

export const VocabularyDetailModal: React.FC<VocabularyDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onItemUpdated,
}) => {
  const [personalNotes, setPersonalNotes] = useState(item?.personalNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const handleToggleFav = async () => {
    try { await toggleFavorite(item.id); await onItemUpdated(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update favorite.'); }
  };

  const handleToggleDiff = async () => {
    try { await toggleDifficult(item.id); await onItemUpdated(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update difficulty.'); }
  };

  const handleSaveNotes = async () => {
    if (isSavingNotes) return;
    setIsSavingNotes(true);
    try { await updateVocabulary(item.id, { personalNotes }); await onItemUpdated(); setError(''); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save notes.'); }
    finally { setIsSavingNotes(false); }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${item.word}"?`)) {
      try { await onDelete(item.id); onClose(); }
      catch (error) { setError(error instanceof Error ? error.message : 'Could not delete word.'); }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="vocab-word text-xl font-bold font-heading tracking-tight text-[var(--color-cream)]">{item.word}</span>
          {item.ipa && <span className="vocab-text text-xs font-mono text-[var(--color-cream)]/70">{item.ipa}</span>}
          <AudioButton text={item.word} size="sm" />
          <POSBadge pos={item.partOfSpeech} />
          <CEFRBadge level={item.cefrLevel} />
          <StatusBadge status={item.learningStatus} />
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {error && <p role="alert">{error}</p>}
        {/* Top Action Bar */}
        <div className="flex items-center justify-between p-3 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFav}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold border transition-all ${
                item.isFavorite
                  ? 'bg-[var(--color-black)] text-[var(--color-cream)] border-[var(--color-orange)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-cream)]/70 border-[var(--color-outline)] hover:text-[var(--color-cream)]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-[var(--color-yellow)] text-[var(--color-cream)]' : ''}`} />
              {item.isFavorite ? 'Favorited' : 'Favorite'}
            </button>

            <button
              type="button"
              onClick={handleToggleDiff}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold border transition-all ${
                item.isDifficult
                  ? 'bg-[var(--color-black)] text-[var(--color-orange-text)] border-[var(--color-orange)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-cream)]/70 border-[var(--color-outline)] hover:text-[var(--color-cream)]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-orange-text)]" />
              {item.isDifficult ? 'Difficult' : 'Mark Difficult'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold bg-[var(--color-surface)] text-[var(--color-cream)] border border-[var(--color-outline)] hover:bg-[var(--color-surface)] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--color-blue-text)]" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold bg-[var(--color-black)]/40 text-[var(--color-orange-text)] border border-[var(--color-orange)]/30 hover:bg-[var(--color-black)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[var(--color-orange-text)]" />
              Delete
            </button>
          </div>
        </div>

        {/* Primary Meanings Grid (Warm reading panel) */}
        <LexicalContent item={item} showDictionary={false}/>
        <div className="grid grid-cols-1 gap-4">
          

          <div className="p-4 rounded-none bg-[var(--color-surface)] text-[var(--color-cream)] border border-[var(--color-orange)]/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-blue-text)]">
              English Definition
            </span>
            <p className="vocab-text text-xs font-semibold text-[var(--color-cream)] mt-1 leading-relaxed">
              {item.englishDefinition || '—'}
            </p>
          </div>
        </div>

        {/* Example Sentences */}
        {item.examples && item.examples.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-[var(--color-blue-text)]" />
              Example Sentences
            </h4>
            <div className="space-y-2.5">
              {item.examples.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="p-3.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <SourceAttribution credit={ex.credit} />
                    
                    <p className="vocab-example text-[var(--color-cream)] font-medium leading-relaxed">
                      "{ex.sentence}"
                    </p>
                    
                  </div>
                  <AudioButton text={ex.sentence} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collocations */}
        {item.collocations && item.collocations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--color-blue-text)]" />
              Collocations & Natural Expressions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.collocations.map((col, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="vocab-text font-bold text-[var(--color-cream)] text-xs">{col.collocation}</span>
                    <AudioButton text={col.collocation} size="sm" />
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms & Antonyms */}
        {(item.synonyms.length > 0 || item.antonyms.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {item.synonyms.length > 0 && (
              <div className="p-3.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[var(--color-blue-text)] block text-[11px]">
                  Synonyms & Nuances
                </span>
                <ul className="space-y-1">
                  {item.synonyms.map((s, idx) => (
                    <li key={idx} className="flex items-baseline justify-between gap-2">
                      <span className="vocab-related font-semibold text-[var(--color-cream)]">{s.word}</span>
                      {s.nuance && <span className="vocab-text text-[var(--color-cream)]/70 italic text-right">{s.nuance}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.antonyms.length > 0 && (
              <div className="p-3.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[var(--color-orange-text)] block text-[11px]">
                  Antonyms
                </span>
                <ul className="space-y-1">
                  {item.antonyms.map((a, idx) => (
                    <li key={idx} className="flex items-baseline justify-between gap-2">
                      <span className="vocab-related font-semibold text-[var(--color-cream)]">{a.word}</span>
                      {a.nuance && <span className="vocab-text text-[var(--color-cream)]/70 italic text-right">{a.nuance}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Editable Personal Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)]">
              Personal Study Notes
            </label>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-blue-text)] hover:text-[var(--color-blue-text)]/80 font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              Save Notes
            </button>
          </div>
          <textarea
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="Add personal mnemonics, study context, or reflections..."
            rows={2}
            className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)]"
          />
        </div>

        {/* Provenance & SRS Footer */}
        <div className="pt-4 border-t border-[var(--color-outline)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--color-cream)]/70">
          <div className="space-y-1">
            <span className="font-semibold text-[var(--color-cream)] block">Content Provenance</span>
            <ProvenanceBadge
              sourceType={item.provenance.sourceType}
              sourceName={item.provenance.sourceName}
              isVerified={item.provenance.isVerified}
            />
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-[var(--color-cream)] block">SuperMemo SM-2 Parameters</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-1.5 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)]">
                <span className="text-[var(--color-cream)]/70 block text-[10px]">Interval</span>
                <span className="text-[var(--color-cream)] font-semibold">{item.srs.interval}d</span>
              </div>
              <div className="p-1.5 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)]">
                <span className="text-[var(--color-cream)]/70 block text-[10px]">Ease Factor</span>
                <span className="text-[var(--color-cream)] font-semibold">{item.srs.easeFactor}</span>
              </div>
              <div className="p-1.5 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)]">
                <span className="text-[var(--color-cream)]/70 block text-[10px]">Due Date</span>
                <span className="text-[var(--color-cream)] font-semibold">{item.srs.nextReviewDate}</span>
              </div>
            </div>
          </div>
        </div>
        <ExternalWordContent key={item.id} item={item} onRefresh={onItemUpdated} />
      </div>
    </Modal>
  );
};
