// The readiness document on the web side (catalog: Missing-data states, ADR-0080 decisions 3 and 4). The pipeline
// declares, per catalog row, whether it is available, partial, stale, provided by a provider, training or missing;
// the views never decide that themselves, they read it here. Pure functions over the document, and one cached fetch.
import { getJSON } from '../api/artifacts';
import type {
  ContractState,
  Provenance,
  Readiness,
  ReadinessEntry,
  Text,
} from '../lib/contract.types';

export const READINESS_URL = `${import.meta.env.BASE_URL}data/readiness.json`;

/** The catalog rows each view consumes (docs/contracts/catalog.md). A view whose rows are all available shows nothing. */
export const VIEW_ROWS: Record<string, string[]> = {
  'benchmark-matrix': ['episode-index', 'episode'],
  investigations: ['episode-index', 'episode', 'lineage'],
  'benchmark-adequacy': ['benchmark-adequacy'],
  'research-results': ['research-summary'],
  'semantic-transfer': ['semantic-transfer-index', 'semantic-transfer-report'],
  'semantic-routing': ['routing-study'],
  'recorded-operations': ['operation-index', 'operation-run'],
  'operations-service': ['operations-api'],
};

/** The most severe state first: the order in which a view's rows are reduced to one note. */
export const SEVERITY: ContractState[] = [
  'missing',
  'partial',
  'training',
  'provider',
  'stale',
  'available',
];

/** What the frontend does with a state (the catalog's table "What each surface does"). */
export function behavior(state: ContractState): { showsResult: boolean; note: boolean } {
  return { showsResult: state !== 'missing', note: state !== 'available' };
}

export interface ViewRow {
  id: string;
  state: ContractState;
  provenance: Provenance | null;
  reason: Text | null;
}

/** The readiness of one view: `unknown` when the document is absent or names none of the view's rows. */
export type ViewState = { state: 'unknown' } | { state: ContractState; rows: ViewRow[] };

export const entryFor = (doc: Readiness | null, id: string): ReadinessEntry | undefined =>
  doc?.contracts.find((c) => c.id === id);

/** The most severe state among the rows `ids` names, with each non-available row and its reason. */
export function viewState(doc: Readiness | null, ids: string[]): ViewState {
  const found = ids.map((id) => entryFor(doc, id)).filter((e): e is ReadinessEntry => !!e);
  if (!found.length) return { state: 'unknown' };
  const state = SEVERITY.find((s) => found.some((e) => e.state === s)) ?? 'available';
  const rows = found
    .filter((e) => e.state !== 'available')
    .map((e) => ({ id: e.id, state: e.state, provenance: e.provenance, reason: e.reason }));
  return { state, rows };
}

let cached: Promise<Readiness | null> | null = null;

/** Forgets the fetched document (a test starts clean; a page load never needs it). */
export function resetReadiness(): void {
  cached = null;
}

/**
 * The readiness document, fetched once per page load through `getJSON`. A missing or unreadable document resolves to
 * null (every view then says readiness unknown) and names the cause on the console: it never breaks a view.
 */
export function loadReadiness(): Promise<Readiness | null> {
  cached ??= getJSON<Readiness>(READINESS_URL).then(
    (doc) => {
      if (!doc || !Array.isArray(doc.contracts)) {
        console.error(
          `[readiness] ${READINESS_URL}: no contracts list; every view says readiness unknown`,
        );
        return null;
      }
      return doc;
    },
    (e: unknown) => {
      console.error(
        `[readiness] ${READINESS_URL}: ${String(e)}; every view says readiness unknown`,
      );
      return null;
    },
  );
  return cached;
}
