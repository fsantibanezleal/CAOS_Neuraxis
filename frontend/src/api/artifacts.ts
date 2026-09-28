import { useEffect, useState } from 'react';
import type { ArtifactIndex, Episode } from '../lib/types';
const root = `${import.meta.env.BASE_URL}data/`;
async function getJSON(path: string) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  if (!(r.headers.get('content-type') ?? '').includes('json'))
    throw new Error('Expected JSON evidence');
  return r.json();
}
let indexRequest: Promise<ArtifactIndex> | undefined;
export function loadIndex(refresh = false): Promise<ArtifactIndex> {
  if (refresh) indexRequest = undefined;
  const request: Promise<ArtifactIndex> =
    indexRequest ??
    getJSON(`${root}index.json`).catch((error) => {
      if (indexRequest === request) indexRequest = undefined;
      throw error;
    });
  indexRequest = request;
  return request;
}
export interface EpisodeReference {
  run_id: string;
  case_id: string;
  method_id: string;
  variant?: string;
  seed?: number;
  path?: string;
  url?: string;
  status?: string;
  sha256?: string;
  [key: string]: unknown;
}
export function episodeReferences(index: ArtifactIndex | null): EpisodeReference[] {
  if (!index) return [];
  const value = index.episodes ?? index.runs;
  return Array.isArray(value)
    ? (value.filter((x) => x && typeof x === 'object') as EpisodeReference[])
    : [];
}
export function normalizeEpisode(value: unknown): Episode {
  if (!value || typeof value !== 'object') throw new Error('Invalid episode');
  const v = value as Record<string, unknown>;
  if (
    typeof v.case_id !== 'string' ||
    typeof v.method_id !== 'string' ||
    !Array.isArray(v.decisions) ||
    v.decisions.length > 100000
  )
    throw new Error('Invalid episode');
  const decisions = v.decisions.map((raw, i) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid decision');
    const d = raw as Record<string, unknown>;
    const sequence = Number(d.sequence ?? i),
      timestamp = Number(d.timestamp_ms ?? d.elapsed_ms ?? i);
    if (!Number.isInteger(sequence) || sequence < 0 || !Number.isFinite(timestamp) || timestamp < 0)
      throw new Error('Invalid decision coordinates');
    const candidates = (Array.isArray(d.candidates) ? d.candidates : []).map((raw) => {
      if (!raw || typeof raw !== 'object') throw new Error('Invalid candidate');
      const c = raw as Record<string, unknown>;
      const action = c.action ?? c.action_id;
      if (typeof action !== 'string') throw new Error('Invalid candidate action');
      for (const key of ['score', 'probability'])
        if (c[key] != null && (typeof c[key] !== 'number' || !Number.isFinite(c[key])))
          throw new Error('Invalid candidate score');
      if (typeof c.probability === 'number' && (c.probability < 0 || c.probability > 1))
        throw new Error('Invalid probability');
      return {
        ...c,
        action,
        allowed: c.allowed === true,
        score: typeof c.score === 'number' ? c.score : undefined,
        probability: typeof c.probability === 'number' ? c.probability : undefined,
      };
    });
    const rawUncertainty = d.uncertainty;
    const confidence =
      rawUncertainty && typeof rawUncertainty === 'object'
        ? (rawUncertainty as Record<string, unknown>).confidence
        : undefined;
    if (Array.isArray(d.resources) && d.resources.some((r) => !r || typeof r.id !== 'string'))
      throw new Error('Invalid resource');
    return {
      ...d,
      sequence,
      timestamp_ms: timestamp,
      event_kind: String(d.event_kind ?? 'decision'),
      action: String(d.action ?? d.action_id ?? 'unknown'),
      status: String(d.status ?? 'observed'),
      candidates,
      reason: String(d.reason ?? ''),
      uncertainty: typeof rawUncertainty === 'number' ? rawUncertainty : undefined,
      detail: {
        ...((d.detail as object) ?? {}),
        ...((d.diagnostics as object) ?? {}),
        ...(Array.isArray(d.resources) ? { resources: d.resources } : {}),
        probability_evidence: rawUncertainty,
        confidence,
      },
    };
  });
  if (Array.isArray(v.resources) && v.resources.some((r) => !r || typeof r.id !== 'string'))
    throw new Error('Invalid resource');
  return {
    ...v,
    schema_version:
      typeof v.schema_version === 'number'
        ? v.schema_version
        : String(v.schema_version ?? 'neuraxis.episode.v1'),
    run_id: String(v.run_id ?? 'imported'),
    case_id: v.case_id,
    method_id: v.method_id,
    variant: String(v.variant ?? 'nominal'),
    seed: Number(v.seed ?? 0),
    lane: String(v.lane ?? 'imported'),
    parameters: { ...((v.parameters as object) ?? {}) },
    status: String(v.status ?? 'unknown'),
    events: Array.isArray(v.events) ? v.events : [],
    decisions,
    resources: Array.isArray(v.resources) ? v.resources : [],
    metrics: typeof v.metrics === 'object' && v.metrics ? v.metrics : {},
    provenance: typeof v.provenance === 'object' && v.provenance ? v.provenance : {},
  } as Episode;
}
export async function loadVerifiedIndex(
  path: string,
  sha256: string,
  signal?: AbortSignal,
): Promise<ArtifactIndex> {
  if (path.includes('..') || /^\w+:/.test(path) || path.startsWith('/'))
    throw new Error('Evidence path must be relative');
  if (!/^[a-f0-9]{64}$/i.test(sha256)) throw new Error('Canonical index requires a SHA-256 digest');
  if (!globalThis.crypto?.subtle)
    throw new Error('Canonical index verification requires a secure browser context');
  const response = await fetch(`${root}${path}`, { signal });
  if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
    throw new Error(`HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  if (digest !== sha256.toLowerCase()) throw new Error('Canonical index SHA-256 mismatch');
  const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!value || typeof value !== 'object' || !Array.isArray((value as ArtifactIndex).episodes))
    throw new Error('Invalid canonical index');
  return value as ArtifactIndex;
}

export async function loadEpisode(ref: EpisodeReference): Promise<Episode> {
  const path = String(ref.path ?? ref.url ?? `episodes/${ref.run_id}.json`);
  if (path.includes('..') || /^\w+:/.test(path) || path.startsWith('/'))
    throw new Error('Evidence path must be relative');
  if (typeof ref.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(ref.sha256))
    throw new Error('Canonical evidence requires a SHA-256 digest');
  if (!globalThis.crypto?.subtle)
    throw new Error('Canonical evidence verification requires a secure browser context');
  const response = await fetch(`${root}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!(response.headers.get('content-type') ?? '').includes('json'))
    throw new Error('Expected JSON evidence');
  const bytes = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  if (digest !== ref.sha256.toLowerCase())
    throw new Error('Canonical evidence SHA-256 mismatch; refresh the evidence index');
  const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!raw || typeof raw !== 'object') throw new Error('Invalid canonical episode');
  const record = raw as Record<string, unknown>;
  for (const key of ['run_id', 'case_id', 'method_id', 'variant', 'seed'] as const) {
    if (ref[key] !== undefined && record[key] !== ref[key])
      throw new Error(`Canonical evidence identity mismatch: ${key}`);
  }
  return normalizeEpisode(record);
}
export function useArtifacts() {
  const [index, setIndex] = useState<ArtifactIndex | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadIndex(generation > 0)
      .then((v) => {
        if (alive) {
          setIndex(v);
          setError('');
        }
      })
      .catch((e) => {
        if (alive) setError(String(e.message));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [generation]);
  return { index, error, loading, reload: () => setGeneration((n) => n + 1) };
}
export function downloadJSON(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function api(path: string, token: string, body?: unknown) {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = '';
    try {
      const value = await response.json();
      detail =
        typeof value.detail === 'string'
          ? value.detail
          : typeof value.error === 'string'
            ? value.error
            : '';
    } catch {
      /* A static host may return HTML for unavailable API routes. */
    }
    throw new Error(`HTTP ${response.status}${detail ? `: ${detail.slice(0, 1000)}` : ''}`);
  }
  return response.json();
}
