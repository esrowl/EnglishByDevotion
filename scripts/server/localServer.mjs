import { randomBytes, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import {evaluateLanguage,translateSense} from './languageFeedback.mjs';

const stores = ['vocabulary', 'reviewLogs', 'dailySessions', 'readings', 'contentCache'];
export function validateSnapshot(value) {
  if (!value || value.appName !== 'EnglishByDevotion — Personal Vocabulary Lab' || !value.data) throw new Error('Invalid EnglishByDevotion backup.');
  for (const store of stores) if (!Array.isArray(value.data[store])) throw new Error(`Missing backup store: ${store}`);
  for(const store of ['grammarProgress','grammarAttempts','discoveryEncounters','discoveryPreferences','recallAttempts','lexicon','lexicalAttempts','grammarPlacements','grammarPreferences','grammarProduction']) if(value.data[store]!==undefined && !Array.isArray(value.data[store]))throw new Error(`Invalid backup store: ${store}`);
  if (!value.data.settings || value.data.settings.id !== 'user_settings') throw new Error('Invalid settings.');
  if (value.data.vocabulary.some(v => !v || typeof v.id !== 'string' || typeof v.word !== 'string' || !v.word.trim())) throw new Error('Invalid vocabulary record.');
  return value;
}

export function localPersistencePlugin({ storageRoot } = {}) {
  const token = randomBytes(32).toString('hex');
  let queue = Promise.resolve();
  return {
    name: 'englishbydevotion-local-persistence',
    configureServer(server) { install(server); },
    configurePreviewServer(server) { install(server); },
  };
  function install(server) {
    const root = storageRoot || process.env.EBD_STORAGE_DIR || path.join(server.config.root, 'storage', 'backups');
    const current = path.join(root, 'current.json');
    const send = (res, status, data) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(data)); };
    server.middlewares.use(async (req, res, next) => {
      const route = req.url?.split('?')[0];
      // Vite serves files from the project root. Never serve the private backup
      // directory as a static asset, even if an alternate backup root is in use.
      let decoded;
      try { decoded = decodeURIComponent(route || ''); } catch { return send(res, 400, {error:'Invalid request path.'}); }
      const normalized = path.posix.normalize(decoded.replaceAll('\\', '/'));
      const privatePath = path.resolve(server.config.root, 'storage', 'backups').replaceAll('\\', '/');
      if (normalized === '/storage/backups' || normalized.startsWith('/storage/backups/') ||
          normalized === `/@fs${privatePath}` || normalized.startsWith(`/@fs${privatePath}/`)) {
        return send(res, 403, {error:'Private backups are not served as static files.'});
      }
      if (!route?.startsWith('/__local/')) return next();
      const address = req.socket.remoteAddress;
      const host = req.headers.host || '';
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) || !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) return send(res, 403, {error:'Loopback access only.'});
      if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin && req.headers.origin !== `http://${host}`)) return send(res, 403, {error:'Cross-origin access denied.'});
      if (req.method === 'OPTIONS') return send(res, 403, {error:'Cross-origin preflight denied.'});
      if (req.method !== 'GET' && (req.headers['x-ebd-token'] !== token || req.headers.origin !== `http://${host}` || !req.headers['content-type']?.startsWith('application/json'))) return send(res, 403, {error:'Local session authorization required.'});
      try {
        if(['/__local/language-feedback','/__local/translate-sense'].includes(route)&&req.method==='POST'){
          const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>18000)return send(res,413,{error:'Answer too long.'});chunks.push(chunk);}
          const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
          return send(res,200,await(route==='/__local/translate-sense'?translateSense(input):evaluateLanguage(input)));
        }
        if (route === '/__local/status' && req.method === 'GET') {
          await queue.catch(()=>{});
          const saved = await readFile(current,'utf8').catch(()=>null);
          const revision = saved ? createHash('sha256').update(JSON.stringify(JSON.parse(saved).data)).digest('hex') : '';
          return send(res,200,{token, managed:process.env.EBD_MANAGED === '1', backupAvailable:!!saved, revision});
        }
        if (route === '/__local/backup' && req.method === 'GET') {
          await queue.catch(()=>{});
          const data = await readFile(current, 'utf8').catch(error => { if(error.code === 'ENOENT') return null; throw error; });
          return send(res, data ? 200 : 404, data ? JSON.parse(data) : {error:'No local backup yet.'});
        }
        if (route === '/__local/backup' && req.method === 'PUT') {
          const chunks = []; let size = 0;
          for await (const chunk of req) { size += chunk.length; if (size > 64 * 1024 * 1024) return send(res, 413, {error:'Backup exceeds the 64 MB request safety limit. Export JSON instead.'}); chunks.push(chunk); }
          const snapshot = validateSnapshot(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          const hash = createHash('sha256').update(JSON.stringify(snapshot.data)).digest('hex');
          const save = async () => {
            await mkdir(path.join(root, 'history'), {recursive:true, mode:0o700});
            const previous = await readFile(current,'utf8').catch(()=>null);
            const previousHash = previous ? createHash('sha256').update(JSON.stringify(JSON.parse(previous).data)).digest('hex') : '';
            if ((req.headers['x-ebd-revision'] || '') !== previousHash) throw Object.assign(new Error('A newer backup was saved by another browser. Reload or restore the local backup before saving.'), {status:409});
            if (previous) {
              const prior = JSON.parse(previous);
              for(const store of ['lexicon','lexicalAttempts'])if(prior.data[store]?.length&&!Array.isArray(snapshot.data[store]))throw Object.assign(new Error('This older app omits lexical data. Reload before saving.'),{status:409});
              for(const store of ['grammarPlacements','grammarPreferences','grammarProduction'])if(prior.data[store]?.length&&!Array.isArray(snapshot.data[store]))throw Object.assign(new Error('This older app omits advanced grammar records. Reload before saving.'),{status:409});
              for(const store of ['grammarProgress','grammarAttempts']) if(prior.data[store]?.length && !Array.isArray(snapshot.data[store]))throw Object.assign(new Error('This older app snapshot omits grammar records. Reload the updated application before saving.'),{status:409});
              for(const store of ['discoveryEncounters','discoveryPreferences','recallAttempts']) if(prior.data[store]?.length && !Array.isArray(snapshot.data[store]))throw Object.assign(new Error('This older app snapshot omits discovery records. Reload the updated application before saving.'),{status:409});
              if (createHash('sha256').update(JSON.stringify(prior.data)).digest('hex') === hash) return;
              // Archive the previous state before replacing the current pointer.
              const oldHash = createHash('sha256').update(previous).digest('hex');
              await writeFile(path.join(root,'history',`${Date.now()}-${oldHash}.json`),previous,{mode:0o600,flag:'wx'});
            }
            const temp = path.join(root, `.pending-${randomBytes(12).toString('hex')}.json`);
            await writeFile(temp, JSON.stringify(snapshot,null,2), {mode:0o600,flag:'wx'});
            await rename(temp, current);
          };
          const task = queue.catch(()=>{}).then(save); queue = task; await task;
          return send(res, 200, {saved:true, hash, savedAt:new Date().toISOString()});
        }
        if (route === '/__local/shutdown' && req.method === 'POST') {
          if (process.env.EBD_MANAGED !== '1') return send(res, 409, {error:'This server was not started with the launcher. Close this tab or use Ctrl+C in its Terminal.'});
          await queue.catch(()=>{}); send(res,200,{closing:true});
          setTimeout(async()=>{if(server.close)await server.close();else await new Promise(resolve=>server.httpServer.close(resolve));process.exit(0);},250);
          return;
        }
        return send(res,404,{error:'Unknown local operation.'});
      } catch(error) { return send(res,error.status || 400,{error:error.message || 'Local operation failed.'}); }
    });
  }
}
