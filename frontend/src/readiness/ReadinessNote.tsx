// The inline note of a view: one bilingual line, inside the container the view already has (ADR-0071: no new row,
// no new page), naming the reason the readiness document gives for the rows the view consumes. An available view
// shows nothing; the text always comes from the document, never from a state typed in the view.
import { useShellLang } from '@fasl-work/caos-app-shell';
import type { ReactNode } from 'react';
import type { Text } from '../lib/contract.types';
import { useReadiness } from './useReadiness';
import { viewState, type ViewState } from './readiness';

type Lang = 'en' | 'es';

export const STATE_LABEL: Record<string, Text> = {
  available: { en: 'Available', es: 'Disponible' },
  partial: { en: 'Partial build', es: 'Versión parcial' },
  stale: { en: 'Stale bake', es: 'Generación desactualizada' },
  provider: { en: 'Provider', es: 'Proveedor' },
  training: { en: 'Model status', es: 'Estado del modelo' },
  missing: { en: 'Not available yet', es: 'Aún no disponible' },
  unknown: { en: 'Readiness unknown', es: 'Disponibilidad desconocida' },
};

/** A provider reason names a file path: it wraps anywhere instead of widening the container (the gate's G5). */
export const WRAP = { overflowWrap: 'anywhere' } as const;

const UNKNOWN_REASON: Text = {
  en: 'the readiness document could not be read.',
  es: 'no se pudo leer el documento de disponibilidad.',
};

/** The reasons of a reduced view state, one per distinct text, each led by the row ids when there are several. */
export function reasonText(view: Exclude<ViewState, { state: 'unknown' }>, lang: Lang): string {
  const texts = new Set<string>();
  for (const row of view.rows) if (row.reason) texts.add(row.reason[lang]);
  const several = texts.size > 1;
  return [...texts]
    .map((text) => {
      const ids = view.rows
        .filter((r) => r.reason?.[lang] === text)
        .map((r) => r.id)
        .join(', ');
      return several ? `${ids}: ${text}` : text;
    })
    .join(' ');
}

/** The note for a reduced view state; renders nothing when the view is available. Pure: the test renders it. */
export function NoteLine({ view, lang }: { view: ViewState; lang: Lang }) {
  if (view.state === 'available') return null;
  if (view.state === 'unknown') {
    return (
      <p className="caos-plot-note" style={WRAP} data-readiness="unknown">
        {STATE_LABEL.unknown[lang]}: {UNKNOWN_REASON[lang]}
      </p>
    );
  }
  return (
    <p className="caos-plot-note" style={WRAP} data-readiness={view.state}>
      {STATE_LABEL[view.state][lang]}: {reasonText(view, lang)}
    </p>
  );
}

/**
 * The note for the catalog rows `ids`, from the readiness document; nothing while the document loads. With a
 * `fallback`, the view keeps its own wording while the document loads, cannot be read, or says available.
 */
export function ReadinessNote({ ids, fallback = null }: { ids: string[]; fallback?: ReactNode }) {
  const lang = useShellLang();
  const doc = useReadiness();
  if (doc === undefined) return <>{fallback}</>;
  const view = viewState(doc, ids);
  if (fallback !== null && (view.state === 'unknown' || view.state === 'available'))
    return <>{fallback}</>;
  return <NoteLine view={view} lang={lang} />;
}
