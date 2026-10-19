/** Literal Unicode word/phrase matching, including punctuation such as c++. */
export function targetPattern(target: string): RegExp {
  const escaped = target.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
}
export function containsTarget(text: string, target: string): boolean {
  return !!target.trim() && targetPattern(target).test(text);
}
