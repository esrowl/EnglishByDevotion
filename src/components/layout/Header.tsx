import React from 'react';
import { NavTab } from './Sidebar';
import { SnowAccumulation } from '../common/SnowAccumulation';
import { Plus, Sparkles } from 'lucide-react';
import {CyberPortrait} from '../common/CyberPortrait';

interface HeaderProps {
  activeTab: NavTab;
  onOpenAddModal: () => void;
  learnedTodayCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenAddModal,
  learnedTodayCount = 0,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string; code: string }> = {
    grammar:{title:'Grammar Library',subtitle:'Learn, observe, practise and revisit. Local lessons with explained answers.',code:'LEARN://GRAMMAR'},
    reading: { title: 'Reading Library', subtitle: 'Upload your writing. Explore English meanings and usage.', code: 'LIB://READING' },
    dashboard: {
      title: 'Retro Study Desk',
      subtitle: 'One quiet place to keep learning.',
      code: 'SYS://DASHBOARD',
    },
    daily: {
      title: 'Continuous Study & Discovery',
      subtitle: 'Learn as few or as many words as you choose. No quotas.',
      code: 'MOD://CONTINUOUS_STUDY',
    },
    flashcards: {
      title: 'Flashcards & Active Recall',
      subtitle: '6 active drill modes with SuperMemo SM-2 spacing.',
      code: 'DRILL://ACTIVE_RECALL',
    },
    writing: {
      title: 'Personal Writing Notes',
      subtitle: 'Ungraded personal examples. No grammar or usage checking is performed.',
      code: 'STUDIO://WRITING_LAB',
    },
    library: {
      title: 'Vocabulary Deck & Catalog',
      subtitle: 'Explore and search your complete collection of rich vocabulary cards.',
      code: 'DB://LEXICAL_CATALOG',
    },
    review: {
      title: 'Spaced Repetition Review Queue',
      subtitle: 'Ebbinghaus forgetting curve intervals and due cards.',
      code: 'QUEUE://SRS_INTERVALS',
    },
    import: {
      title: 'Import & Export Center',
      subtitle: 'Import structured vocabulary from JSON, CSV, Markdown or AI prompt files.',
      code: 'IO://IMPORT_EXPORT',
    },
    statistics: {
      title: 'Learning Statistics',
      subtitle: 'Track your vocabulary retention rate and CEFR progression.',
      code: 'STATS://MEMORY_ANALYTICS',
    },
    settings: {
      title: 'Preferences & Storage',
      subtitle: 'Configure study preferences and manage local database backups.',
      code: 'CFG://SYSTEM_PREFERENCES',
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="retro-header relative min-h-[4.75rem] border-b-2 border-black bg-[var(--color-black)] px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-[0_4px_0px_#000000]">
      <div className="header-cyber-art" aria-hidden="true"><CyberPortrait /><span>+ : / SYS<br/>0 1 0 —</span></div>
      {/* Header title and system code above decorative background layers */}
      <div className="relative z-10 flex items-center gap-3.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-pixel text-[var(--color-blue-text)] uppercase tracking-wider hidden md:inline">
              {current.code}
            </span>
            <span className="text-[var(--color-pink-text)] hidden md:inline font-bold">/</span>
            <h2 className="text-sm sm:text-base font-bold font-pixel text-[var(--color-cream)] tracking-tight">
              {current.title}
            </h2>
          </div>
          <p className="text-xs text-[var(--color-cream)]/75 font-sans mt-0.5 max-w-xl truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Header Right: Today's Learned Pill & New Word Action */}
      <div className="relative z-10 shrink-0 flex items-center gap-3">
        {learnedTodayCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border-2 border-black text-xs font-bold text-[var(--color-cream)] font-pixel shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-orange-text)]" />
            <span>{learnedTodayCount} LEARNED TODAY</span>
          </div>
        )}

        <button
          type="button"
          aria-label="New word"
          onClick={onOpenAddModal}
          className="retro-btn-orange px-4 py-2 text-[11px] rounded-none flex items-center gap-1.5 cursor-pointer font-bold uppercase"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">NEW WORD</span>
        </button>
      </div>

      {/* Subtle Pixel Snow Drift on Header Bottom Ledge */}
      <SnowAccumulation position="bottom" height={8} />
    </header>
  );
};
