import React, { useState, useMemo } from 'react';
import {
  VocabularyItem,
} from '../../types/vocabulary';
import { CEFRBadge, POSBadge, StatusBadge } from '../common/Badge';
import { AudioButton } from '../common/AudioButton';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Star,
  AlertTriangle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { toggleFavorite, toggleDifficult } from '../../services/db';
import { DictionaryLookup } from './DictionaryLookup';
import { WordDiscovery } from './WordDiscovery';

interface LibraryViewProps {
  vocabulary: VocabularyItem[];
  onOpenDetail: (item: VocabularyItem) => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  vocabulary,
  onOpenDetail,
  onOpenAddModal,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const [selectedCEFR, setSelectedCEFR] = useState<string>('all');
  const [selectedPOS, setSelectedPOS] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [filterDifficultOnly, setFilterDifficultOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'alpha' | 'date' | 'srs' | 'difficulty'>('date');

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    vocabulary.forEach((item) => {
      item.topicCategories?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [vocabulary]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return vocabulary
      .filter((item) => {
        if (q) {
          const matchWord = item.word.toLowerCase().includes(q);
          const matchEn = item.englishDefinition.toLowerCase().includes(q);
          const matchTr=item.turkishMeaning.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr').trim())||item.lexicalData?.senses.some(s=>s.turkish.some(t=>t.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr').trim())));
          const matchEx = item.examples.some((e) =>
            e.sentence.toLowerCase().includes(q)
          );
          const matchCol = item.collocations.some((c) =>
            c.collocation.toLowerCase().includes(q)
          );
          const matchSyn = item.synonyms.some((s) => s.word.toLowerCase().includes(q));
          const matchAnt = item.antonyms.some((a) => a.word.toLowerCase().includes(q));

          if (!matchWord && !matchEn && !matchTr && !matchEx && !matchCol && !matchSyn && !matchAnt) {
            return false;
          }
        }

        if (selectedCEFR !== 'all' && item.cefrLevel !== selectedCEFR) return false;
        if (selectedPOS !== 'all' && item.partOfSpeech !== selectedPOS) return false;
        if (selectedStatus !== 'all' && item.learningStatus !== selectedStatus) return false;
        if (selectedTopic !== 'all' && !item.topicCategories.includes(selectedTopic)) return false;
        if (filterFavoritesOnly && !item.isFavorite) return false;
        if (filterDifficultOnly && !item.isDifficult) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') {
          return a.word.localeCompare(b.word);
        } else if (sortBy === 'date') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        } else if (sortBy === 'srs') {
          return (a.srs.nextReviewDate || '').localeCompare(b.srs.nextReviewDate || '');
        } else if (sortBy === 'difficulty') {
          return (b.srs.lapses || 0) - (a.srs.lapses || 0);
        }
        return 0;
      });
  }, [
    vocabulary,
    searchQuery,
    selectedCEFR,
    selectedPOS,
    selectedStatus,
    selectedTopic,
    filterFavoritesOnly,
    filterDifficultOnly,
    sortBy,
  ]);

  const handleToggleFav = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await toggleFavorite(id);
    onRefresh();
  };

  const handleToggleDiff = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await toggleDifficult(id);
    onRefresh();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <WordDiscovery onOpenDetail={onOpenDetail} onRefresh={onRefresh} />
      <DictionaryLookup onOpenDetail={onOpenDetail} onRefresh={onRefresh} />
      {/* Search & Filter Header Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-cream)]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words, definitions, collocations, or examples..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-sm text-[var(--color-cream)] placeholder-[var(--color-cream)]/30 focus:outline-none focus:border-[var(--color-blue)]"
            />
          </div>

          {/* Quick Favorite & Difficult Filter Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-none border transition-colors ${
                filterFavoritesOnly
                  ? 'bg-[var(--color-black)] text-[var(--color-cream)] border-[var(--color-orange)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-cream)]/70 border-[var(--color-outline)] hover:text-[var(--color-cream)]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-[var(--color-yellow)] text-[var(--color-cream)]' : ''}`} />
              Favorites
            </button>

            <button
              type="button"
              onClick={() => setFilterDifficultOnly(!filterDifficultOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-none border transition-colors ${
                filterDifficultOnly
                  ? 'bg-[var(--color-black)] text-[var(--color-orange-text)] border-[var(--color-orange)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-cream)]/70 border-[var(--color-outline)] hover:text-[var(--color-cream)]'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterDifficultOnly ? 'text-[var(--color-orange-text)]' : ''}`} />
              Difficult
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs font-semibold text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)] cursor-pointer"
            >
              <option value="date">Sort: Recently Added</option>
              <option value="alpha">Sort: Alphabetical (A-Z)</option>
              <option value="srs">Sort: Next Review Date</option>
              <option value="difficulty">Sort: Most Difficult</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <select
            value={selectedCEFR}
            onChange={(e) => setSelectedCEFR(e.target.value)}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]/80 focus:outline-none"
          >
            <option value="all">All CEFR Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <select
            value={selectedPOS}
            onChange={(e) => setSelectedPOS(e.target.value)}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]/80 focus:outline-none"
          >
            <option value="all">All Parts of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="idiom">Idiom</option>
            <option value="phrasal_verb">Phrasal Verb</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]/80 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
          </select>

          {allTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)]/80 focus:outline-none"
            >
              <option value="all">All Topics</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <div className="ml-auto text-xs text-[var(--color-cream)]/70 font-mono">
            Showing {filteredItems.length} of {vocabulary.length} words
          </div>
        </div>
      </div>

      {/* Vocabulary Card Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={vocabulary.length === 0 ? 'Your vocabulary library is empty' : 'No words match your search'}
          description={
            vocabulary.length === 0
              ? 'Start by adding your first word or importing vocabulary notes.'
              : 'Try clearing your search query or relaxing your filter selections.'
          }
          actionText={vocabulary.length === 0 ? 'Add Word' : 'Clear Filters'}
          onAction={
            vocabulary.length === 0
              ? onOpenAddModal
              : () => {
                  setSearchQuery('');
                  setSelectedCEFR('all');
                  setSelectedPOS('all');
                  setSelectedStatus('all');
                  setSelectedTopic('all');
                  setFilterFavoritesOnly(false);
                  setFilterDifficultOnly(false);
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.slice(0, visibleCount).map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetail(item)}
              className="group p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] hover:border-[var(--color-orange)]/60 hover:bg-[var(--color-surface)] transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_#000] relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="vocab-word text-lg font-bold font-heading text-[var(--color-cream)] group-hover:text-[var(--color-cream)] transition-colors">
                        {item.word}
                      </h3>
                      {item.ipa && (
                        <span className="vocab-text text-xs font-mono text-[var(--color-cream)]/70">{item.ipa}</span>
                      )}
                      <AudioButton text={item.word} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFav(e, item.id)}
                      className={`p-1 rounded-none transition-colors ${
                        item.isFavorite
                          ? 'text-[var(--color-cream)]'
                          : 'text-[var(--color-cream)]/70 hover:text-[var(--color-cream)]/70'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-[var(--color-yellow)]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleDiff(e, item.id)}
                      className={`p-1 rounded-none transition-colors ${
                        item.isDifficult
                          ? 'text-[var(--color-orange-text)]'
                          : 'text-[var(--color-cream)]/70 hover:text-[var(--color-cream)]/70'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <POSBadge pos={item.partOfSpeech} />
                  <CEFRBadge level={item.cefrLevel} />
                  <StatusBadge status={item.learningStatus} />
                </div>
              </div>

              {/* Meanings */}
              <div className="space-y-1.5">
                {item.turkishMeaning?<p className="vocab-text">{item.turkishMeaning}</p>:item.lexicalData?.senses.filter(s=>s.turkish.length).slice(0,1).map(s=><p key={s.id} className="vocab-text">{s.turkish.join(' · ')} <span className="vocab-related">({s.partOfSpeech} · {s.definition})</span></p>)}
                {item.englishDefinition && (
                  <p className="vocab-text text-xs text-[var(--color-cream)]/70  leading-relaxed">
                    {item.englishDefinition}
                  </p>
                )}
              </div>

              {/* Examples preview */}
              {item.examples && item.examples.length > 0 && (
                <div className="vocab-example p-2.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] text-xs text-[var(--color-cream)]/70 italic ">
                  "{item.examples[0].sentence}"
                </div>
              )}

              {/* Card Footer */}
              <div className="pt-2 border-t border-[var(--color-outline)] flex items-center justify-between text-xs text-[var(--color-cream)]/70 font-mono">
                <div className="truncate max-w-[160px]">
                  {item.topicCategories?.[0] || 'General'}
                </div>
                <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[var(--color-blue-text)] font-semibold text-[11px]">
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredItems.length > visibleCount && <button type="button" onClick={() => setVisibleCount(count => count + 60)} className="px-4 py-2 border border-[var(--color-blue)]">Show more words ({filteredItems.length - visibleCount} remaining)</button>}
    </div>
  );
};
