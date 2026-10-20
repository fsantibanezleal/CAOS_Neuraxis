// The header check of BR-002, kept out of the test module so the gate test and the planted-defect suite both import it.
const HEADER_ORDER = [
  '/app',
  '/introduction',
  '/methodology',
  '/implementation',
  '/experiments',
  '/benchmark',
];
/** The header check of BR-002, exported so the planted-defect suite runs the gate's own function: every route has a link and the links keep the standard order. */
export function headerOrderProblems(page: string): string[] {
  const hrefs = [...page.matchAll(/<a [^>]*href="(\/[a-z]*)(?:[?#][^"]*)?"/g)].map((m) => m[1]);
  const seen = HEADER_ORDER.map((p) => hrefs.indexOf(p));
  const out = HEADER_ORDER.filter((_, i) => seen[i] < 0).map((p) => `no header link for ${p}`);
  const found = seen.filter((i) => i >= 0);
  if (found.join() !== [...found].sort((a, b) => a - b).join())
    out.push('header links out of order');
  return out;
}
