import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Layers,
  BookOpen,
  RotateCcw,
  FileDown,
  BarChart3,
  Settings,
  PenLine,
  GraduationCap,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'daily'
  | 'flashcards'
  | 'writing'
  | 'grammar'
  | 'library'
  | 'reading'
  | 'review'
  | 'import'
  | 'statistics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  dueCount: number;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  dueCount,
  totalCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Home Desk',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'daily' as NavTab,
      label: 'Continuous Study',
      icon: Compass,
      badge: null,
    },
    {
      id: 'flashcards' as NavTab,
      label: 'Flashcard Drill',
      icon: Layers,
      badge: null,
    },
    {
      id: 'writing' as NavTab,
      label: 'Writing Notes',
      icon: PenLine,
      badge: null,
    },
    {
      id: 'library' as NavTab,
      label: 'Vocabulary Deck',
      icon: BookOpen,
      badge: totalCount > 0 ? `${totalCount}` : null,
      badgeVariant: 'neutral' as const,
    },
    {
      id: 'review' as NavTab,
      label: 'Review Queue',
      icon: RotateCcw,
      badge: dueCount > 0 ? `${dueCount}` : null,
      badgeVariant: 'alert' as const,
    },
    { id: 'reading' as NavTab, label: 'Reading Library', icon: BookOpen, badge: null },
    { id: 'grammar' as NavTab, label: 'Grammar', icon: GraduationCap, badge: null },
    {
      id: 'import' as NavTab,
      label: 'Import & Export',
      icon: FileDown,
      badge: null,
    },
    {
      id: 'statistics' as NavTab,
      label: 'Statistics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="retro-navigation w-16 sm:w-64 shrink-0 bg-[var(--color-black)] border-r-2 border-black flex flex-col justify-between h-screen sticky top-0 select-none z-20 shadow-[4px_0px_0px_#000000]">
      {/* Brand Header */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="retro-brand p-3.5 border-b-2 border-black flex items-center gap-3">
          <div className="hidden sm:block min-w-0">
            <h1 className="app-brand font-extrabold tracking-tight text-[var(--color-cream)]">
              EnglishBy<span className="block text-[var(--color-cream)]">Devotion</span>
            </h1>
            <p className="text-[9px] text-[var(--color-orange-text)] font-pixel tracking-tight font-bold truncate mt-0.5">
              BY ESRA · PERSONAL LEARNING
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-1 sm:p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-pixel tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-blue)] text-[var(--color-cream)] border-2 border-black shadow-[3px_3px_0px_#000000] font-bold'
                    : 'text-[var(--color-cream)]/80 hover:bg-[var(--color-surface)] hover:text-[var(--color-ivory)] border-2 border-transparent hover:border-black'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[var(--color-cream)]' : 'text-[var(--color-blue-text)]'
                    }`}
                  />
                  <span className="hidden sm:inline text-[11px] truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`hidden sm:inline px-1.5 py-0.5 text-[9px] font-pixel border-2 border-black ${
                      item.badgeVariant === 'alert'
                        ? 'bg-[var(--color-orange)] text-[var(--color-cream)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-cream)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="hidden sm:block p-3 m-3 bg-[var(--color-surface)] border-2 border-black text-xs text-[var(--color-cream)]/80 space-y-1.5 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--color-cream)] flex items-center gap-1.5 text-[10px] font-pixel">
            <span className="w-2 h-2 bg-[var(--color-blue)] inline-block animate-pulse"></span>
            NETSCAPE READY
          </span>
          <span className="text-[9px] font-pixel text-[var(--color-blue-text)] bg-black px-1 py-0.5">
            ONLINE
          </span>
        </div>
        <p className="text-[9px] text-[var(--color-cream)]/70 font-sans leading-tight">
          Saved words stay local. New source lookups need internet.
        </p>
      </div>
    </aside>
  );
};
