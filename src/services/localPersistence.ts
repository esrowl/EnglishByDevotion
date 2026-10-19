import { liveQuery } from 'dexie';
import { db, exportDatabaseJSON, importDatabaseJSON } from './db';

type LocalStatus = {available:boolean; message:string; savedAt?:string; managed?:boolean};
let status: LocalStatus = {available:false, message:'Checking local backup…'};
const listeners = new Set<(value:LocalStatus)=>void>();
let session: {token:string;revision:string;managed:boolean;backupAvailable:boolean} | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let subscription: {unsubscribe:()=>void} | undefined;
let writing = Promise.resolve();
export const getLocalStatus = () => status;
export function subscribeLocalStatus(listener:(value:LocalStatus)=>void) { listeners.add(listener); listener(status); return () => {listeners.delete(listener);}; }
function publish(message:string, savedAt?:string) { status={available:!!session,message,savedAt,managed:session?.managed};listeners.forEach(listener=>listener(status)); }
async function request(path:string, method='GET', body?:string) {
  const response = await fetch(`/__local/${path}`, {method, credentials:'same-origin', headers:method === 'GET' ? {} : {'Content-Type':'application/json','X-EBD-Token':session?.token || '', 'X-EBD-Revision':session?.revision || ''}, body, signal:AbortSignal.timeout(15000)});
  const data = await response.json().catch(() => { throw new Error('Local backup server unavailable.'); });
  if (!response.ok) throw new Error(data.error || 'Local backup unavailable.');
  return data;
}
let initialization: Promise<void> | undefined;
export function initializeLocalPersistence(): Promise<void> { return initialization ||= initialize(); }
async function initialize(): Promise<void> {
  try {
    session = await request('status');
    // Only a genuinely new profile is automatically restored. Never replace user data.
    if (session?.backupAvailable && !(await db.vocabulary.count()) && !(await db.settings.count())) {
      const snapshot = await request('backup');
      const result = await importDatabaseJSON(JSON.stringify(snapshot),'empty-profile');
      if (result.error) throw new Error(result.error);
    }
    publish('Local backup ready.');
  } catch(error) {
    const message = session?.backupAvailable
      ? `Local backup could not be restored: ${error instanceof Error ? error.message : 'unknown error'}. Existing disk data was not changed.`
      : 'Saved in this browser only. Use Export everything to keep a backup or move your data.';
    session=undefined;publish(message);
  }
}
export function startAutoBackup() {
  if (!session || subscription) return;
  subscription = liveQuery(exportDatabaseJSON).subscribe({
    next:()=>{clearTimeout(timer);timer=setTimeout(()=>void saveAllLocally().catch(()=>{}),1800);},
    error:error=>publish(`Automatic backup paused: ${String(error)}`),
  });
}
export function stopAutoBackup() {clearTimeout(timer);subscription?.unsubscribe();subscription=undefined;}
export async function saveAllLocally(): Promise<void> {
  if (!session) throw new Error('Local disk backup is unavailable. Export a full JSON backup instead.');
  clearTimeout(timer);
  const task = writing.catch(()=>{}).then(async()=>{
    publish('Saving local backup…');
    try {
      const result = await request('backup','PUT',await exportDatabaseJSON());
      session!.revision=result.hash;
      publish('All saved records backed up locally.',result.savedAt);
    } catch(error) {publish(error instanceof Error ? error.message : 'Backup failed.');throw error;}
  });
  writing=task;await task;
}
export async function restoreLocalBackup(): Promise<number> {
  if (!session) throw new Error('Local disk backup is unavailable.');
  stopAutoBackup();
  try {
    const snapshot = await request('backup');
    const result = await importDatabaseJSON(JSON.stringify(snapshot));
    if(result.error) throw new Error(result.error);
    session=await request('status');
    publish('Local backup merged; existing notes and progress preserved.');
    return result.count;
  } finally {startAutoBackup();}
}
export async function clearExternalCache(): Promise<void> {
  // Intentionally scoped: saved vocabulary, sentences, readings and history survive.
  await db.contentCache.clear();
  if(session) await saveAllLocally();
}
export async function closeApplication(): Promise<boolean> {
  await saveAllLocally();stopAutoBackup();
  if (session?.managed) {await request('shutdown','POST','{}');return true;}
  return false;
}
export function downloadFullBackup(json:string) {
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`EnglishByDevotion-Esra-${new Date().toISOString().replaceAll(':','-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
