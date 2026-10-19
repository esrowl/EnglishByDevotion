import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, FlashcardMode } from '../../types/vocabulary';
import { getSettings, saveSettings, resetWithSeedData, importDatabaseJSON } from '../../services/db';
import {getLocalStatus, restoreLocalBackup, subscribeLocalStatus} from '../../services/localPersistence';
import {
  Save,
  RotateCcw,
  Upload,
  CheckCircle2,
  Database,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [portableRestore,setPortableRestore]=useState(false);
  const [localBackupAvailable,setLocalBackupAvailable]=useState(getLocalStatus().available);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeLocalStatus(status => setLocalBackupAvailable(status.available)), []);

  useEffect(() => {
    const load = async () => {
      try {
      const s = await getSettings();
      setSettings(s);
      } catch (error) { setError(error instanceof Error ? error.message : 'Could not load preferences.'); }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
    await saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    await onRefresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save preferences.'); }
  };

  const handleResetSampleData = async () => {
    if (
      window.confirm(
        'Add missing sample vocabulary? Your existing words, notes and progress will be preserved.'
      )
    ) {
      await resetWithSeedData();
      onRefresh();
      alert('Missing sample words added. Existing data preserved.');
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const res = await importDatabaseJSON(text,portableRestore?'portable':'merge');
      if (res.error) {
        setImportStatus(`Restore error: ${res.error}`);
      } else {
        setImportStatus(`Successfully restored ${res.count} vocabulary items!`);
        onRefresh();
      }
    };
    reader.readAsText(file);
  };

  if (!settings) return <p role="alert" className="p-6">{error || 'Loading preferences…'}</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {error && <p role="alert">{error}</p>}
      {saveSuccess && (
        <div className="p-4 rounded-none bg-[var(--color-blue)]/40 border border-[var(--color-blue)] text-[var(--color-cream)] text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--color-blue-text)]" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {importStatus && (
        <div className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] text-[var(--color-cream)] text-xs font-semibold flex items-center gap-3">
          <Database className="w-5 h-5 text-[var(--color-blue-text)]" />
          <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Learning Preferences */}
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
          <h3 className="text-base font-bold font-heading text-[var(--color-cream)] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--color-blue-text)]" />
            Learning Preferences & Rhythm
          </h3>

          <div className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-1">
            <span className="text-xs font-bold text-[var(--color-cream)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-blue-text)]" />
              Open-Ended Learning Enabled
            </span>
            <p className="text-xs text-[var(--color-cream)]/70 leading-relaxed">
              EnglishByDevotion operates on a continuous, flexible rhythm. You can study 1, 5, or 20 words whenever you want without rigid daily quotas.
            </p>
          </div>

          {/* Default Flashcard Mode */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-cream)] font-mono">
              Default Flashcard Practice Mode
            </label>
            <select
              value={settings.defaultFlashcardMode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultFlashcardMode: e.target.value as FlashcardMode,
                })
              }
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-xs text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-blue)]"
            >
              <option value="en_to_tr">Mode A: Word → Definition</option>
              <option value="tr_to_en">Mode B: Definition → Word</option>
              <option value="sentence_context">Mode C: Example Sentence Context Fill</option>
              <option value="collocation">Mode D: Collocation Completion</option>
              <option value="synonym_antonym">Mode E: Synonym & Antonym Clue Drill</option>
              <option value="typed_recall">Mode F: Typed Active Recall</option>
            </select>
          </div>
        </div>

        {/* Local Storage & Backup Restore */}
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
          <h3 className="text-base font-bold font-heading text-[var(--color-cream)] flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--color-orange-text)]" />
            Local Database & Restore
          </h3>

          <p className="text-xs text-[var(--color-cream)]/70 leading-relaxed">
            All your vocabulary records, spaced repetition history, and custom personal notes are stored locally in your browser's persistent IndexedDB database.
          </p>
          {localBackupAvailable && <button type="button" className="retro-btn-teal p-2" onClick={()=>void restoreLocalBackup().then(count=>{setImportStatus(`Local backup merged: ${count} additional words. Existing records preserved.`);return onRefresh();}).catch(error=>setError(error.message))}>Restore local disk backup</button>}

          <input
            ref={restoreFileRef}
            type="file"
            accept=".json"
            onChange={handleRestoreBackup}
            className="hidden"
          />
          <label className="block text-sm"><input type="checkbox" checked={portableRestore} onChange={event=>setPortableRestore(event.target.checked)} /> Portable restore: include backup preferences and keep conflicting vocabulary as separate records. Existing notes and progress are never deleted.</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => restoreFileRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-bold text-[var(--color-cream)] bg-[var(--color-surface)] hover:bg-[var(--color-surface)] border border-[var(--color-outline)] transition-colors"
            >
              <Upload className="w-4 h-4 text-[var(--color-blue-text)]" />
              Restore from Backup JSON
            </button>

            <button
              type="button"
              onClick={handleResetSampleData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-bold text-[var(--color-orange-text)] bg-[var(--color-black)]/40 hover:bg-[var(--color-black)] border border-[var(--color-orange)]/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[var(--color-orange-text)]" />
              Add Missing Sample Vocabulary
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-none shadow-[3px_3px_0px_#000] shadow-black transition-all"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
