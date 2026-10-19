export const normalizeWord = (word: string) => word.trim().toLowerCase().normalize('NFC');

export function validLookup(word: string): string {
  const normalized = normalizeWord(word);
  if (!/^[a-z]+(?:[ '-][a-z]+)*$/.test(normalized) || normalized.length > 80) {
    throw new Error('Enter an English word (letters, spaces, apostrophes or hyphens).');
  }
  return normalized;
}

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export async function requestJSON(url: string, timeoutMs = 12000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    if (response.status === 404) throw new Error('No dictionary entry was found for this word. Try another spelling.');
    if (response.status === 429) throw new Error('The source is busy. Please wait before trying again.');
    if (!response.ok) throw new Error('The content source is temporarily unavailable. Your saved words are still available.');
    try { return await response.json(); } catch { throw new Error('The content source returned invalid JSON. Please try again later.'); }
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The request timed out. Please try again.');
    if (error instanceof TypeError) throw new Error('Unable to connect. Check your connection; saved and cached content remains available.');
    throw error;
  } finally { clearTimeout(timer); }
}

export const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v.trim()) : [];
export const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
export const text = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
