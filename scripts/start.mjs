import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const port = portArg >= 0 ? Number(args[portArg + 1]) : 5173;
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid port.');
console.log('\x1b[36m\n╔══════════════════════════════════════════════════════╗\n║  ENGLISH BY DEVOTION · A WINTER STUDY DESK           ║\n║  Created with devotion by Esra                      ║\n║  [ OWL ONLINE ]  [ LOCAL SAVE ]  [ RETRO MODE ]      ║\n╚══════════════════════════════════════════════════════╝\x1b[0m\n');
const url = `http://localhost:${port}`;
const noBrowser = args.includes('--no-browser') || args.includes('--smoke');
const config = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!config.scripts?.dev || !existsSync(path.join(root, 'node_modules/vite/bin/vite.js'))) {
  console.error('Bağımlılıklar eksik. Bu klasörde npm install çalıştırıp tekrar deneyin.');
  process.exit(1);
}
if (args.includes('--check')) {
  console.log(`Başlatıcı hazır. Node ${process.version}; proje: ${root}; adres: ${url}`);
  process.exit(0);
}
const health = () => new Promise(resolve => {
  const req = request({hostname: '127.0.0.1', port, path: '/', timeout: 1200}, res => {
    let html = '';
    res.on('data', chunk => { if (html.length < 100000) html += chunk; });
    res.on('end', () => resolve({app: res.statusCode === 200 && html.includes('<title>EnglishByDevotion') && html.includes('/@vite/client')}));
  });
  req.on('error', () => resolve(null)); req.on('timeout', () => req.destroy()); req.end();
});
const openBrowser = () => {
  console.log(`EnglishByDevotion hazır: ${url}`);
  if (!noBrowser) {
    const opener = spawn('/usr/bin/open', [url], {stdio: 'ignore'});
    opener.on('error', error => console.error(`Tarayıcı açılamadı: ${error.message}. ${url} adresini açın.`));
  }
};
const existing = await health();
if (existing) {
  if (!existing.app) { console.error(`${port} portu başka bir uygulama tarafından kullanılıyor. Veri adresini değiştirmemek için başlatma durduruldu.`); process.exit(1); }
  openBrowser(); process.exit(0);
}
console.log('EnglishByDevotion başlatılıyor… Terminali açık tutun. Durdurmak için Ctrl+C.');
const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {cwd: root, stdio: 'inherit', env:{...process.env,EBD_MANAGED:'1'}});
let exited = false;
let stopping = false;
server.on('error', error => { exited = true; console.error(error.message); process.exitCode = 1; });
server.on('exit', code => { exited = true; process.exitCode = stopping ? 0 : code || 0; });
const stop = () => { stopping = true; if (!exited) server.kill('SIGTERM'); };
process.on('SIGINT', stop); process.on('SIGTERM', stop); process.on('exit', stop);
let ready = false;
for (let i = 0; i < 120 && !exited; i++) {
  if ((await health())?.app) { ready = true; break; }
  await new Promise(resolve => setTimeout(resolve, 250));
}
if (!ready) { console.error('Sunucu başlatılamadı. Yukarıdaki hata mesajını kontrol edin.'); stop(); process.exitCode = 1; }
else { openBrowser(); if (args.includes('--smoke')) stop(); }
