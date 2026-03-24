/**
 * True when this document was loaded via a full reload (F5, Ctrl+R, etc.).
 * Some environments omit `reload` on PerformanceNavigationTiming; legacy API as fallback.
 */
export function isDocumentReload(): boolean {
  if (typeof performance === 'undefined') return false;

  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const nav = entries[0];
  if (nav?.type === 'reload') return true;

  const legacy = (performance as unknown as { navigation?: { type: number } }).navigation;
  // 1 = TYPE_RELOAD (deprecated API, still widely available)
  if (legacy?.type === 1) return true;

  return false;
}
