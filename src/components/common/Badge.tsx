import React from 'react';
import { CEFRLevel, LearningStatus, PartOfSpeech, ProvenanceType } from '../../types/vocabulary';
import { ShieldCheck, Sparkles, User, FileText } from 'lucide-react';

export const CEFRBadge: React.FC<{ level?: CEFRLevel }> = ({ level }) => {
  if (!level || level === 'Unspecified') return null;

  const colorMap: Record<CEFRLevel, string> = {
    A1: 'bg-[var(--color-blue)]/30 text-[var(--color-blue-text)] border-[var(--color-blue)]/60',
    A2: 'bg-[var(--color-blue)]/40 text-[var(--color-blue-text)] border-[var(--color-blue)]/60',
    B1: 'bg-[var(--color-surface)] text-[var(--color-cream)] border-[var(--color-orange)]/40',
    B2: 'bg-[var(--color-surface)] text-[var(--color-cream)] border-[var(--color-orange)]/60',
    C1: 'bg-[var(--color-black)] text-[var(--color-cream)] border-[var(--color-orange)]',
    C2: 'bg-[var(--color-black)] text-[var(--color-orange-text)] border-[var(--color-orange)] font-bold',
    Unspecified: 'bg-[var(--color-surface)] text-[var(--color-cream)]/50 border-[var(--color-outline)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-none border font-mono tracking-wide ${
        colorMap[level] || colorMap.Unspecified
      }`}
    >
      {level}
    </span>
  );
};

export const POSBadge: React.FC<{ pos: PartOfSpeech }> = ({ pos }) => {
  const labelMap: Record<PartOfSpeech, string> = {
    noun: 'noun',
    verb: 'verb',
    adjective: 'adj',
    adverb: 'adv',
    idiom: 'idiom',
    phrasal_verb: 'phr v',
    expression: 'expr',
    conjunction: 'conj',
    preposition: 'prep',
    other: 'other',
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-none bg-[var(--color-surface)] text-[var(--color-cream)]/80 border border-[var(--color-outline)] italic font-sans">
      {labelMap[pos] || pos}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: LearningStatus }> = ({ status }) => {
  const statusStyles: Record<LearningStatus, { bg: string; text: string; border: string; label: string; dot: string }> = {
    new: { bg: 'bg-[var(--color-surface)]', text: 'text-[var(--color-cream)]/70', border: 'border-[var(--color-outline)]', label: 'New', dot: 'bg-[var(--color-surface)]/40' },
    learning: { bg: 'bg-[var(--color-black)]/80', text: 'text-[var(--color-cream)]', border: 'border-[var(--color-orange)]/50', label: 'Learning', dot: 'bg-[var(--color-orange)]' },
    review: { bg: 'bg-[var(--color-blue)]/40', text: 'text-[var(--color-blue-text)]', border: 'border-[var(--color-blue)]', label: 'Review', dot: 'bg-[var(--color-blue)]' },
    mastered: { bg: 'bg-[var(--color-green)]/15', text: 'text-[var(--color-green)]', border: 'border-[var(--color-green)]', label: 'Mastered', dot: 'bg-[var(--color-green)]' },
  };

  const style = statusStyles[status] || statusStyles.new;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border font-mono ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export const ProvenanceBadge: React.FC<{
  sourceType: ProvenanceType;
  sourceName?: string;
  isVerified?: boolean;
}> = ({ sourceType, sourceName, isVerified }) => {
  if (sourceType === 'dictionary_verified' || isVerified) {
    return (
      <span
        title={sourceName ? `Source: ${sourceName}` : 'Dictionary Verified'}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-none bg-[var(--color-blue)]/40 text-[var(--color-cream)] border border-[var(--color-blue)]/60 font-mono"
      >
        <ShieldCheck className="w-3 h-3 text-[var(--color-blue-text)]" />
        {sourceName || 'Dictionary Verified'}
      </span>
    );
  }

  if (sourceType === 'ai_generated') {
    return (
      <span
        title="AI-generated content (Unverified dictionary citation)"
        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-none bg-[var(--color-surface)] text-[var(--color-orange-text)] border border-[var(--color-outline)] font-mono"
      >
        <Sparkles className="w-3 h-3 text-[var(--color-orange-text)]" />
        AI Curated
      </span>
    );
  }

  if (sourceType === 'user_created') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-none bg-[var(--color-black)] text-[var(--color-cream)] border border-[var(--color-outline)] font-mono">
        <User className="w-3 h-3 text-[var(--color-cream)]" />
        Custom Card
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-none bg-[var(--color-surface)] text-[var(--color-cream)]/60 border border-[var(--color-outline)] font-mono">
      <FileText className="w-3 h-3 text-[var(--color-cream)]/40" />
      {sourceName || 'Imported File'}
    </span>
  );
};
