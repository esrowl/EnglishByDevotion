import React, { useMemo } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import {
  TrendingUp,
  Award,
  Brain,
  Layers,
  AlertTriangle,
  History,
} from 'lucide-react';

interface StatisticsViewProps {
  vocabulary: VocabularyItem[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ vocabulary }) => {
  const metrics = useLiveQuery(async () => {
    const [recent, total, successful] = await Promise.all([
      db.reviewLogs.orderBy('timestamp').reverse().limit(20).toArray(),
      db.reviewLogs.count(), db.reviewLogs.where('rating').anyOf('good', 'easy').count(),
    ]);
    return {recent, total, successful};
  }, []);
  const reviewLogs = metrics?.recent || [];
  const totalReviews = metrics?.total || 0;

  const statusCounts = useMemo(() => {
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    vocabulary.forEach((item) => {
      counts[item.learningStatus] = (counts[item.learningStatus] || 0) + 1;
    });
    return counts;
  }, [vocabulary]);

  const cefrCounts = useMemo(() => {
    const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0, Unspecified: 0 };
    vocabulary.forEach((item) => {
      const lvl = item.cefrLevel || 'Unspecified';
      counts[lvl] = (counts[lvl] || 0) + 1;
    });
    return counts;
  }, [vocabulary]);

  const retentionRate = useMemo(() => {
    return totalReviews ? Math.round(((metrics?.successful || 0) / totalReviews) * 100) : 0;
  }, [metrics, totalReviews]);

  const difficultCount = vocabulary.filter((v) => v.isDifficult || v.srs.lapses > 0).length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vocabulary */}
        <div className="p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-2 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between text-[var(--color-cream)]/70">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Total Library
            </span>
            <Layers className="w-4 h-4 text-[var(--color-blue-text)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-cream)] font-mono">
            {vocabulary.length}
          </div>
          <p className="text-[11px] text-[var(--color-cream)]/70">Saved in persistent storage</p>
        </div>

        {/* Mastered Words */}
        <div className="p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-2 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between text-[var(--color-cream)]/70">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Mastered (SM-2)
            </span>
            <Award className="w-4 h-4 text-[var(--color-blue-text)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-blue-text)] font-mono">
            {statusCounts.mastered}
          </div>
          <p className="text-[11px] text-[var(--color-cream)]/70">
            {vocabulary.length > 0
              ? `${Math.round((statusCounts.mastered / vocabulary.length) * 100)}% of library`
              : '0%'}
          </p>
        </div>

        {/* Retention Rate */}
        <div className="p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-2 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between text-[var(--color-cream)]/70">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Retention Accuracy
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--color-orange-text)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-orange-text)] font-mono">
            {reviewLogs.length > 0 ? `${retentionRate}%` : '—'}
          </div>
          <p className="text-[11px] text-[var(--color-cream)]/70">Across {totalReviews} review sessions</p>
        </div>

        {/* Difficult Queue */}
        <div className="p-5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-2 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between text-[var(--color-cream)]/70">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Difficult Words
            </span>
            <AlertTriangle className="w-4 h-4 text-[var(--color-orange-text)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-orange-text)] font-mono">
            {difficultCount}
          </div>
          <p className="text-[11px] text-[var(--color-cream)]/70">Items with recall lapses</p>
        </div>
      </div>

      {/* Progress Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] font-heading flex items-center gap-2">
            <Brain className="w-4 h-4 text-[var(--color-blue-text)]" />
            Learning Lifecycle Distribution
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'New Words', count: statusCounts.new, color: 'bg-[var(--color-surface)]' },
              { label: 'Learning Phase', count: statusCounts.learning, color: 'bg-[var(--color-orange)]' },
              { label: 'Review Stage', count: statusCounts.review, color: 'bg-[var(--color-blue)]' },
              { label: 'Mastered', count: statusCounts.mastered, color: 'bg-[var(--color-blue)]' },
            ].map((st) => {
              const pct = vocabulary.length > 0 ? Math.round((st.count / vocabulary.length) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[var(--color-cream)] font-sans">{st.label}</span>
                    <span className="text-[var(--color-cream)]/70">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden border border-[var(--color-outline)]">
                    <div
                      className={`${st.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEFR Level Breakdown */}
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] font-heading flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--color-blue-text)]" />
            CEFR Level Distribution
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
              <div
                key={lvl}
                className="p-3 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-center space-y-1"
              >
                <span className="text-xs font-bold text-[var(--color-cream)] font-mono">{lvl}</span>
                <div className="text-xl font-extrabold text-[var(--color-cream)] font-mono">
                  {cefrCounts[lvl] || 0}
                </div>
                <span className="text-[10px] text-[var(--color-cream)]/70 font-mono block">
                  {vocabulary.length > 0
                    ? `${Math.round(((cefrCounts[lvl] || 0) / vocabulary.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] font-heading flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--color-blue-text)]" />
          Recent Spaced Repetition Logs
        </h3>

        {reviewLogs.length === 0 ? (
          <p className="text-xs text-[var(--color-cream)]/70 italic py-4 text-center">
            No practice sessions recorded yet. Start practicing to populate this log.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[300px] border border-[var(--color-outline)] rounded-none">
            <table className="w-full text-left text-xs text-[var(--color-cream)]/80">
              <thead className="bg-[var(--color-surface)] sticky top-0 text-[var(--color-cream)] font-semibold border-b border-[var(--color-outline)] font-mono">
                <tr>
                  <th className="p-3">Word</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Scheduled Interval</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline)]/50 bg-[var(--color-surface)] font-mono">
                {reviewLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="p-3 font-sans font-bold text-[var(--color-cream)]">{log.word}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.rating === 'easy'
                            ? 'bg-[var(--color-blue)]/30 text-[var(--color-blue-text)] border border-[var(--color-blue)]'
                            : log.rating === 'good'
                            ? 'bg-[var(--color-blue)]/40 text-[var(--color-cream)] border border-[var(--color-blue)]'
                            : log.rating === 'hard'
                            ? 'bg-[var(--color-black)] text-[var(--color-cream)] border border-[var(--color-outline)]'
                            : 'bg-[var(--color-black)] text-[var(--color-orange-text)] border border-[var(--color-orange)]'
                        }`}
                      >
                        {log.rating}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--color-cream)]/70 font-sans">{log.mode}</td>
                    <td className="p-3 text-[var(--color-blue-text)]">+{log.scheduledIntervalDays} days</td>
                    <td className="p-3 text-[var(--color-cream)]/70 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
