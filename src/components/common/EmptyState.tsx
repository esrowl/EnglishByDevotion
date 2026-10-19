import React from 'react';
import { LucideIcon, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[var(--color-surface)] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-4 ${className}`}
    >
      <div className="mb-2">
        <Icon aria-hidden="true" className="w-8 h-8 text-[var(--color-blue-text)]" />
      </div>

      <h3 className="text-sm sm:text-base font-bold font-pixel text-[var(--color-cream)] tracking-wide">
        {title}
      </h3>

      <p className="text-xs text-[var(--color-cream)]/80 max-w-md font-sans leading-relaxed">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionText && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="retro-btn-orange px-5 py-2.5 text-xs font-bold font-pixel uppercase rounded-none cursor-pointer"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="retro-btn-teal px-4 py-2.5 text-xs font-bold font-pixel uppercase rounded-none cursor-pointer"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
