import React, { useState, useRef } from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import {
  processFileForImport,
  ImportPreviewResult,
  exportVocabularyToCSV,
} from '../../services/importer';
import { db, getAllVocabulary, addVocabulary, updateVocabulary, exportDatabaseJSON } from '../../services/db';
import { CEFRBadge, POSBadge } from '../common/Badge';
import {
  FileDown,
  FileUp,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Sparkles,
} from 'lucide-react';

interface ImportViewProps {
  vocabulary: VocabularyItem[];
  onImportComplete: () => void;
}

export const ImportView: React.FC<ImportViewProps> = ({
  vocabulary,
  onImportComplete,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'overwrite' | 'keep_both'>('skip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 64 * 1024 * 1024) { setPreviewResult(null); setFileName(''); setErrorMessage('File exceeds 64 MB. Choose a smaller file.'); e.target.value = ''; return; }

    setSuccessMessage(null);
    setErrorMessage(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;

      setIsProcessing(true);
      try {
      const result = await processFileForImport(content, file.name);
      setPreviewResult(result);
      setErrorMessage(result.error || null);
      } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'File could not be read.'); }
      finally { setIsProcessing(false); }
    };
    reader.onerror = () => { setErrorMessage('File could not be read. Please choose it again.'); setIsProcessing(false); };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!previewResult || previewResult.items.length === 0) return;
    if (isProcessing) return;

    setIsProcessing(true);
    let importedCount = 0;
    let skippedCount = 0;

    try {
    await db.transaction('rw', db.vocabulary, async () => {
    const existingWords = new Map((await getAllVocabulary()).map(v => [v.normalizedHeadword, v]));
    for (const parsed of previewResult.items) {
      const existingItem = existingWords.get(parsed.item.normalizedHeadword);
      if (existingItem) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === 'overwrite') {
          if (existingItem) {
            await updateVocabulary(existingItem.id, {
              englishDefinition: existingItem.englishDefinition || parsed.item.englishDefinition,
              turkishMeaning: existingItem.turkishMeaning || parsed.item.turkishMeaning,
              examples: existingItem.examples.length ? existingItem.examples : parsed.item.examples,
            });
            importedCount++;
            continue;
          }
        }
      }

      await addVocabulary(parsed.item, duplicateStrategy === 'keep_both');
      existingWords.set(parsed.item.normalizedHeadword, parsed.item);
      importedCount++;
    }
    });

    setIsProcessing(false);
    setSuccessMessage(
      `Successfully imported ${importedCount} vocabulary records (${skippedCount} duplicates skipped).`
    );
    setPreviewResult(null);
    setFileName('');
    onImportComplete();
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Import failed; no records were changed.'); }
    finally { setIsProcessing(false); }
  };

  const handleExportJSON = async () => {
    const jsonStr = await exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `englishbydevotion-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCSV = () => {
    const csvStr = exportVocabularyToCSV(vocabulary);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `englishbydevotion-vocabulary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadSampleJSON = () => {
    const a = document.createElement('a');
    a.href = '/sample-englishbydevotion-import.json';
    a.download = 'sample-englishbydevotion-import.json';
    a.click();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {successMessage && (
        <div className="p-4 rounded-none bg-[var(--color-blue)]/40 border border-[var(--color-blue)] text-[var(--color-cream)] text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--color-blue-text)]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-none bg-[var(--color-black)]/60 border border-[var(--color-orange)] text-[var(--color-orange-text)] text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--color-orange-text)]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--color-cream)] flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[var(--color-blue-text)]" />
                Import Vocabulary Files
              </h3>
              <p className="text-xs text-[var(--color-cream)]/70 mt-0.5">
                Upload vocabulary files generated by AI assistants, exported from spreadsheets, or written in Markdown notes.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.md,.markdown,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                const file = event.dataTransfer.files[0];
                if (file) void handleFileSelect({target: {files: [file]}} as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-outline)] hover:border-[var(--color-orange)] bg-[var(--color-surface)] hover:bg-[var(--color-surface)] rounded-none p-8 text-center cursor-pointer transition-all duration-150 space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center justify-center text-[var(--color-orange-text)] shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--color-cream)] block">
                  Click to choose file or drag & drop here
                </span>
                <span className="text-xs text-[var(--color-cream)]/70 mt-1 block">
                  Supports JSON, CSV, Markdown (.md), and plain text (.txt)
                </span>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center gap-2 text-[var(--color-cream)]/80">
                <FileCode className="w-4 h-4 text-[var(--color-blue-text)]" />
                <span>JSON</span>
              </div>
              <div className="p-2.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center gap-2 text-[var(--color-cream)]/80">
                <FileSpreadsheet className="w-4 h-4 text-[var(--color-blue-text)]" />
                <span>CSV</span>
              </div>
              <div className="p-2.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center gap-2 text-[var(--color-cream)]/80">
                <FileText className="w-4 h-4 text-[var(--color-orange-text)]" />
                <span>Markdown</span>
              </div>
              <div className="p-2.5 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center gap-2 text-[var(--color-cream)]/80">
                <FileText className="w-4 h-4 text-[var(--color-cream)]" />
                <span>Plain Text</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Prompt Template Card */}
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_#000]">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cream)] font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-orange-text)]" />
              AI Prompt Assistant Template
            </h3>
            <p className="text-xs text-[var(--color-cream)]/70 leading-relaxed">
              Ask Claude, Gemini, or ChatGPT to generate rich vocabulary in EnglishByDevotion's structured format, then upload the output JSON here!
            </p>
            <div className="p-3 bg-[var(--color-surface)] rounded-none border border-[var(--color-outline)] text-[11px] font-mono text-[var(--color-cream)]/70 leading-normal">
              "Create a JSON list of 10 C1 IELTS words with fields: word, partOfSpeech, cefrLevel, ipa, englishDefinition, examples, collocations, synonyms, antonyms"
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleJSON}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-semibold text-[var(--color-cream)] bg-[var(--color-black)] hover:bg-[var(--color-black)] border border-[var(--color-orange)]/40 transition-colors"
          >
            <Download className="w-4 h-4 text-[var(--color-blue-text)]" />
            Download Sample Import JSON
          </button>
        </div>
      </div>

      {/* Live Preview Table */}
      {previewResult && (
        <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-6 shadow-[3px_3px_0px_#000] animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-heading text-[var(--color-cream)] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-blue-text)]" />
                Import Preview: {fileName}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-cream)]/70 font-mono">
                <span>{previewResult.totalParsed} total records parsed</span>
                <span>•</span>
                <span className={previewResult.duplicateCount > 0 ? 'text-[var(--color-orange-text)] font-semibold' : ''}>
                  {previewResult.duplicateCount} duplicates detected
                </span>
              </div>
            </div>

            {previewResult.duplicateCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-cream)]/70 font-mono">Duplicate strategy:</span>
                <select
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-none text-[var(--color-cream)] text-xs focus:outline-none"
                >
                  <option value="skip">Skip duplicates (Recommended)</option>
                  <option value="overwrite">Fill missing content (preserve notes & progress)</option>
                  <option value="keep_both">Import as new entries</option>
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto max-h-[350px] border border-[var(--color-outline)] rounded-none">
            <table className="w-full text-left text-xs text-[var(--color-cream)]/80">
              <thead className="bg-[var(--color-surface)] sticky top-0 text-[var(--color-cream)] font-semibold border-b border-[var(--color-outline)] font-mono">
                <tr>
                  <th className="p-3">Word</th>
                  <th className="p-3">POS</th>
                  <th className="p-3">CEFR</th>
                  
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline)]/50 bg-[var(--color-surface)]">
                {previewResult.items.map((parsed, idx) => (
                  <tr key={idx} className={parsed.isDuplicate ? 'bg-[var(--color-black)]/20' : ''}>
                    <td className="p-3 font-bold text-[var(--color-cream)]">{parsed.item.word}</td>
                    <td className="p-3">
                      <POSBadge pos={parsed.item.partOfSpeech} />
                    </td>
                    <td className="p-3">
                      <CEFRBadge level={parsed.item.cefrLevel} />
                    </td>
                    
                    <td className="p-3 font-mono">
                      {parsed.isDuplicate ? (
                        <span className="px-2 py-0.5 rounded bg-[var(--color-black)] text-[var(--color-orange-text)] border border-[var(--color-orange)]/40 text-[10px]">
                          Duplicate Word
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[var(--color-blue)]/40 text-[var(--color-blue-text)] border border-[var(--color-blue)]/50 text-[10px]">
                          Ready to Import
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPreviewResult(null)}
              className="px-4 py-2 text-xs font-semibold text-[var(--color-cream)]/70 hover:text-[var(--color-cream)] bg-[var(--color-surface)] rounded-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="px-6 py-2.5 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-none shadow-[3px_3px_0px_#000] shadow-black transition-all"
            >
              {isProcessing
                ? 'Importing...'
                : `Confirm & Import ${previewResult.totalParsed} Words`}
            </button>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="p-6 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] space-y-4 shadow-[3px_3px_0px_#000]">
        <div>
          <h3 className="text-base font-bold font-heading text-[var(--color-cream)] flex items-center gap-2">
            <FileDown className="w-5 h-5 text-[var(--color-blue-text)]" />
            Export & Data Backup
          </h3>
          <p className="text-xs text-[var(--color-cream)]/70 mt-0.5">
            Your entire local library, learning history, and review intervals can be backed up as a JSON file or exported to CSV for spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--color-cream)] block">
                Full Database Backup (JSON)
              </span>
              <span className="text-[11px] text-[var(--color-cream)]/70 block">
                Includes all vocabulary, review logs & SRS states.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-4 py-2 text-xs font-bold text-[var(--color-ivory)] bg-[var(--color-blue)] hover:bg-[var(--color-blue)] rounded-none transition-colors shadow-[3px_3px_0px_#000]"
            >
              Export JSON
            </button>
          </div>

          <div className="p-4 rounded-none bg-[var(--color-surface)] border border-[var(--color-outline)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--color-cream)] block">
                Vocabulary Spreadsheet (CSV)
              </span>
              <span className="text-[11px] text-[var(--color-cream)]/70 block">
                Export all headwords, definitions & collocations.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-bold text-[var(--color-cream)] bg-[var(--color-black)] hover:bg-[var(--color-black)] border border-[var(--color-orange)]/40 rounded-none transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
