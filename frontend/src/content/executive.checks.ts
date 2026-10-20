// The checks of BR-009, kept out of the test module so the gate tests and the planted-defect suite both import them.
type Bi = { en: string; es: string };

/** Model and vendor names: the agents the long-workflow benchmark paper evaluates, the model families of the routing and
 * guardrail papers of the dossier, and the vendors behind them. The view says "the best agent". */
const NAMED = [
  'Claude',
  'Anthropic',
  'Opus',
  'Sonnet',
  'Haiku',
  'GPT',
  'OpenAI',
  'ChatGPT',
  'Gemini',
  'Google',
  'Llama',
  'Meta AI',
  'Qwen',
  'DeepSeek',
  'Mistral',
  'Grok',
  'xAI',
  'Microsoft',
  'Amazon',
  'LangChain',
  'LangGraph',
  'Temporal',
];

/** The vendor check of BR-009, exported so the planted-defect suite runs the gate's own function. */
export function vendorProblems(doc: any): string[] {
  const body = JSON.stringify({
    ...doc,
    sources: doc.sources.map((s: { title: Bi; note?: Bi }) => ({ title: s.title, note: s.note })),
  });
  const out = NAMED.filter((n) => new RegExp(`\\b${n}\\b`).test(body)).map((n) => `names ${n}`);
  if (/\b(our client|nuestro cliente|this product|este producto|Neuraxis)\b/i.test(body))
    out.push('names a client or the product');
  return out;
}

/** The language check of BR-009, exported for the same reason: every bilingual text has both languages. */
export function languageProblems(doc: unknown): string[] {
  const out: string[] = [];
  const walk = (n: unknown, path: string): void => {
    if (Array.isArray(n)) n.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (n && typeof n === 'object') {
      const o = n as Record<string, unknown>;
      if (typeof o.en === 'string' && typeof o.es === 'string' && Object.keys(o).length === 2) {
        if (!(o.en.trim() && o.es.trim())) out.push(`${path} lacks a language`);
        return;
      }
      for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
    }
  };
  walk(doc, 'executive');
  return out;
}
