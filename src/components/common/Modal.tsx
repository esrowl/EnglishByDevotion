import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus=document.activeElement as HTMLElement | null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialogRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeRef.current();
      }
      if(e.key==='Tab') {
        const nodes=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') || []).filter(node=>node.getClientRects().length);
        const first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey && (document.activeElement===first || !dialogRef.current?.contains(document.activeElement))) {e.preventDefault();last?.focus();}
        else if(!e.shiftKey && (document.activeElement===last || !dialogRef.current?.contains(document.activeElement))) {e.preventDefault();first?.focus();}
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {window.removeEventListener('keydown', handleKeyDown);document.body.style.overflow=previousOverflow;previousFocus?.focus();};
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-surface)]/80  transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Vocabulary details'}
        className={`relative w-full ${maxWidthClasses[maxWidth]} my-8 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none shadow-[3px_3px_0px_#000] shadow-black/90 overflow-hidden flex flex-col max-h-[90vh] z-10 ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline)] bg-[var(--color-surface)]/70">
            <div className="text-base font-bold text-[var(--color-cream)] font-heading">{title}</div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--color-cream)]/60 hover:text-[var(--color-cream)] hover:bg-[var(--color-black)] rounded-none transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
