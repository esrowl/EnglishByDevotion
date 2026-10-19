import { useEffect, useState } from 'react';
import { getLocalStatus, subscribeLocalStatus, saveAllLocally, clearExternalCache, closeApplication, downloadFullBackup } from '../../services/localPersistence';
import { exportDatabaseJSON } from '../../services/db';

export function StorageControls({hasOpenForm}:{hasOpenForm:boolean}) {
  const [status,setStatus]=useState(getLocalStatus);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [closed,setClosed]=useState(false);
  useEffect(()=>subscribeLocalStatus(setStatus),[]);
  async function run(action:()=>Promise<void>) {if(busy)return;setBusy(true);setMessage('');try{await action();}catch(error){setMessage(error instanceof Error?error.message:'Operation failed.');}finally{setBusy(false);}}
  return <aside aria-label="Storage and application controls" className="border-b border-[var(--color-pink)] bg-[var(--color-surface)] px-3 sm:px-8 py-2 space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      {status.available && <button disabled={busy || closed} className="retro-btn-teal px-3 py-1" onClick={()=>void run(async()=>{if(hasOpenForm)throw new Error('Save the open form first. This button backs up committed records, not unsaved drafts.');await saveAllLocally();})}>Save all</button>}
      <button disabled={busy || closed} className="retro-btn-cream px-3 py-1" onClick={()=>void run(async()=>{downloadFullBackup(await exportDatabaseJSON());setMessage('Full backup exported: vocabulary, notes, reviews, preferences, readings and cache.');})}>Export everything</button>
      <button disabled={busy || closed} className="retro-btn-purple px-3 py-1" onClick={()=>void run(async()=>{if(!confirm('Clear only downloaded source cache? Saved words, examples, notes, readings and review history will stay.'))return;await clearExternalCache();setMessage('External source cache cleared. Your learning library is unchanged.');})}>Clear cache</button>
      {status.available && <button disabled={busy || closed} className="retro-btn-orange px-3 py-1" onClick={()=>void run(async()=>{if(hasOpenForm)throw new Error('Finish saving or cancel your open form before closing.');if(!confirm('Save all committed records and close EnglishByDevotion? Unsaved writing drafts are not included.'))return;const stopped=await closeApplication();if(stopped){setClosed(true);setMessage('Saved and shut down. You can close this tab; use the shortcut to start again.');}else setMessage('Saved. Close this tab; stop the development server with Ctrl+C.');})}>Close app</button>}
      <span className="text-sm text-[var(--color-cream)]/80">EnglishByDevotion · by Esra</span>
    </div>
    <p role="status" aria-live="polite" className="text-sm break-words">{message || status.message}{status.savedAt ? ` · ${new Date(status.savedAt).toLocaleTimeString()}` : ''}</p>
  </aside>;
}
