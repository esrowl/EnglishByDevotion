import React, { useState, useEffect } from 'react';
import {
  VocabularyItem,
  PartOfSpeech,
  CEFRLevel,
  ProvenanceType,
} from '../../types/vocabulary';
import { Modal } from '../common/Modal';
import { createInitialSRSState } from '../../services/srs';
import { Plus, Trash2 } from 'lucide-react';

interface VocabularyEditModalProps {
  item: VocabularyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: VocabularyItem) => Promise<void>;
}

export const VocabularyEditModal: React.FC<VocabularyEditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [word, setWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [ipa, setIpa] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('B2');
  const [turkishMeaning, setTurkishMeaning] = useState('');
  const [englishDefinition, setEnglishDefinition] = useState('');
  const [topicCategories, setTopicCategories] = useState('IELTS Academic, Advanced');
  const [registerUsageNotes, setRegisterUsageNotes] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const [sourceType, setSourceType] = useState<ProvenanceType>('user_created');
  const [sourceName, setSourceName] = useState('');
  const [attribution, setAttribution] = useState('');

  const [examples, setExamples] = useState<{ sentence: string; translation: string }[]>([
    { sentence: '', translation: '' },
  ]);
  const [collocations, setCollocations] = useState<{ collocation: string; meaningTr: string }[]>([
    { collocation: '', meaningTr: '' },
  ]);
  const [synonyms, setSynonyms] = useState<{ word: string; nuance: string }[]>([
    { word: '', nuance: '' },
  ]);
  const [antonyms, setAntonyms] = useState<{ word: string; nuance: string }[]>([
    { word: '', nuance: '' },
  ]);

  useEffect(() => {
    if (item) {
      // Opening a record intentionally resynchronizes the editable draft.
      // eslint-disable-next-line react/set-state-in-effect
      setWord(item.word);
      setIpa(item.ipa || '');
      setPartOfSpeech(item.partOfSpeech);
      setCefrLevel(item.cefrLevel || 'Unspecified');
      setTurkishMeaning(item.turkishMeaning);
      setEnglishDefinition(item.englishDefinition);
      setTopicCategories(item.topicCategories.join(', '));
      setRegisterUsageNotes(item.registerUsageNotes || '');
      setCommonMistakes(item.commonMistakes || '');
      setPersonalNotes(item.personalNotes || '');
      setSourceType(item.provenance.sourceType);
      setSourceName(item.provenance.sourceName || '');
      setAttribution(item.provenance.attribution || '');

      setExamples(
        item.examples && item.examples.length > 0
          ? item.examples.map((e) => ({ sentence: e.sentence, translation: e.translation || '' }))
          : [{ sentence: '', translation: '' }]
      );
      setCollocations(
        item.collocations && item.collocations.length > 0
          ? item.collocations.map((c) => ({ collocation: c.collocation, meaningTr: c.meaningTr || '' }))
          : [{ collocation: '', meaningTr: '' }]
      );
      setSynonyms(
        item.synonyms && item.synonyms.length > 0
          ? item.synonyms.map((s) => ({ word: s.word, nuance: s.nuance || '' }))
          : [{ word: '', nuance: '' }]
      );
      setAntonyms(
        item.antonyms && item.antonyms.length > 0
          ? item.antonyms.map((a) => ({ word: a.word, nuance: a.nuance || '' }))
          : [{ word: '', nuance: '' }]
      );
    } else {
      setWord('');
      setIpa('');
      setPartOfSpeech('adjective');
      setCefrLevel('C1');
      setTurkishMeaning('');
      setEnglishDefinition('');
      setTopicCategories('IELTS Academic, Advanced English');
      setRegisterUsageNotes('');
      setCommonMistakes('');
      setPersonalNotes('');
      setSourceType('user_created');
      setSourceName('');
      setAttribution('');
      setExamples([{ sentence: '', translation: '' }]);
      setCollocations([{ collocation: '', meaningTr: '' }]);
      setSynonyms([{ word: '', nuance: '' }]);
      setAntonyms([{ word: '', nuance: '' }]);
    }
  }, [item, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!word.trim()) {
      alert('Please provide a headword.');
      return;
    }

    const cleanedExamples = examples
      .filter((e) => e.sentence.trim())
      .map((e, idx) => ({
        ...item?.examples.find(original => original.sentence === e.sentence.trim()),
        translationCredit: item?.examples.find(original => original.sentence === e.sentence.trim() && (original.translation || '') === e.translation.trim())?.translationCredit,
        id: item?.examples.find(original => original.sentence === e.sentence.trim())?.id || `ex-${idx}-${Date.now()}`,
        sentence: e.sentence.trim(),
        translation: e.translation.trim() || undefined,
        highlightedTarget: word.trim(),
      }));

    const cleanedCollocations = collocations
      .filter((c) => c.collocation.trim())
      .map((c) => ({
        collocation: c.collocation.trim(),
        meaningTr: c.meaningTr.trim() || undefined,
      }));

    const cleanedSynonyms = synonyms
      .filter((s) => s.word.trim())
      .map((s) => ({
        word: s.word.trim(),
        nuance: s.nuance.trim() || undefined,
      }));

    const cleanedAntonyms = antonyms
      .filter((a) => a.word.trim())
      .map((a) => ({
        word: a.word.trim(),
        nuance: a.nuance.trim() || undefined,
      }));

    const topics = topicCategories
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedItem: VocabularyItem = {
      ...item,
      id: item?.id || `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      word: word.trim(),
      normalizedHeadword: word.trim().toLowerCase(),
      partOfSpeech,
      cefrLevel,
      ipa: ipa.trim() || undefined,
      turkishMeaning,
      englishDefinition: englishDefinition.trim(),
      examples: cleanedExamples,
      collocations: cleanedCollocations,
      synonyms: cleanedSynonyms,
      antonyms: cleanedAntonyms,
      registerUsageNotes: registerUsageNotes.trim() || undefined,
      commonMistakes: commonMistakes.trim() || undefined,
      topicCategories: topics.length > 0 ? topics : ['General'],
      personalNotes: personalNotes.trim() || undefined,
      isFavorite: item?.isFavorite ?? false,
      isDifficult: item?.isDifficult ?? false,
      learningStatus: item?.learningStatus || 'new',
      dateAdded: item?.dateAdded || new Date().toISOString(),
      srs: item?.srs || createInitialSRSState(),
      provenance: {
        ...item?.provenance,
        sourceType,
        sourceName: sourceName.trim() || undefined,
        attribution: attribution.trim() || undefined,
        isVerified: sourceType === 'dictionary_verified',
      },
    };

    setSaving(true); setSaveError('');
    try { await onSave(updatedItem); onClose(); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save the word.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={item ? `Edit "${item.word}"` : 'Add New Vocabulary Record'}
    >
      <form onSubmit={handleSave} className="space-y-6 text-sm">
        {saveError && <p role="alert">{saveError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] mb-1 font-mono">
              Word / Expression *
            </label>
            <input
              type="text"
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. ubiquitous, serendipity"
              className="vocab-text w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] mb-1 font-mono">
              IPA Pronunciation
            </label>
            <input
              type="text"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="e.g. /juːˈbɪk.wə.təs/"
              className="vocab-text w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)] font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)]/70 mb-1 font-mono">
              Part of Speech
            </label>
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
              className="vocab-text w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="idiom">Idiom</option>
              <option value="phrasal_verb">Phrasal Verb</option>
              <option value="expression">Expression</option>
              <option value="conjunction">Conjunction</option>
              <option value="preposition">Preposition</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)]/70 mb-1 font-mono">
              CEFR Level
            </label>
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as CEFRLevel)}
              className="vocab-text w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
            >
              <option value="A1">A1 — Beginner</option>
              <option value="A2">A2 — Elementary</option>
              <option value="B1">B1 — Intermediate</option>
              <option value="B2">B2 — Upper Intermediate</option>
              <option value="C1">C1 — Advanced</option>
              <option value="C2">C2 — Mastery</option>
              <option value="Unspecified">Unspecified</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)]/70 mb-1 font-mono">
              Topic Categories
            </label>
            <input
              type="text"
              value={topicCategories}
              onChange={(e) => setTopicCategories(e.target.value)}
              placeholder="e.g. IELTS, Literature, Science"
              className="vocab-text w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)] text-xs"
            />
          </div>
        </div>

        {/* Turkish Meaning & English Definition */}
        <div className="grid grid-cols-1 gap-4">

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-blue-text)] mb-1 font-mono">
              English Definition
            </label>
            <textarea
              rows={2}
              value={englishDefinition}
              onChange={(e) => setEnglishDefinition(e.target.value)}
              placeholder="e.g. Present or appearing everywhere at the same time."
              className="vocab-text w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)]"
            />
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Example Sentences
            </label>
            <button
              type="button"
              onClick={() => setExamples([...examples, { sentence: '', translation: '' }])}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-blue-text)] hover:text-[var(--color-blue-text)]/80 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Example
            </button>
          </div>

          {examples.map((ex, idx) => (
            <div key={idx} className="p-3 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ex.sentence}
                  onChange={(e) => {
                    const copy = [...examples];
                    copy[idx].sentence = e.target.value;
                    setExamples(copy);
                  }}
                  placeholder="English example sentence..."
                  className="flex-1 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
                />
                {examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExamples(examples.filter((_, i) => i !== idx))}
                    className="p-1.5 text-[var(--color-cream)]/70 hover:text-[var(--color-orange-text)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
            </div>
          ))}
        </div>

        {/* Collocations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Collocations
            </label>
            <button
              type="button"
              onClick={() => setCollocations([...collocations, { collocation: '', meaningTr: '' }])}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-blue-text)] hover:text-[var(--color-blue-text)]/80 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Collocation
            </button>
          </div>

          {collocations.map((col, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={col.collocation}
                onChange={(e) => {
                  const copy = [...collocations];
                  copy[idx].collocation = e.target.value;
                  setCollocations(copy);
                }}
                placeholder="Collocation (e.g. become ubiquitous)"
                className="flex-1 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
              />
              
              {collocations.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCollocations(collocations.filter((_, i) => i !== idx))}
                  className="p-1.5 text-[var(--color-cream)]/70 hover:text-[var(--color-orange-text)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Source Provenance */}
        <div className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
            Source Provenance & Reliability
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as ProvenanceType)}
              className="vocab-text w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]"
            >
              <option value="user_created">User Created</option>
              <option value="dictionary_verified">Dictionary Verified</option>
              <option value="ai_generated">AI Generated</option>
              <option value="imported_file">Imported File</option>
            </select>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="Source name (e.g. Oxford, Cambridge)"
              className="vocab-text w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]"
            />
            <input
              type="text"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="Attribution note"
              className="vocab-text w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-outline)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[var(--color-cream)]/70 hover:text-[var(--color-cream)] bg-[var(--color-surface)] rounded-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-none shadow-[3px_3px_0px_#000] shadow-black transition-all"
          >
            {item ? 'Update Vocabulary Record' : 'Save Vocabulary Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
