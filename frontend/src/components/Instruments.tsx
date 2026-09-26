import { useState, type ReactNode } from 'react';
import { useCopy } from '../i18n';
import { useLangStore } from '@fasl-work/caos-app-shell';
import type { Decision, Episode, Resource } from '../lib/types';
export function format(value: unknown, digits = 2): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(useLangStore.getState().lang, { maximumFractionDigits: digits })
    : typeof value === 'string'
      ? value
      : '--';
}
export function formatFixed(value: number, digits: number): string {
  return Number.isFinite(value)
    ? value.toLocaleString(useLangStore.getState().lang, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '--';
}
export function Panel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`nx-plot ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
export function Timeline({
  episode,
  cursor,
  onCursor,
}: {
  episode: Episode;
  cursor: number;
  onCursor: (n: number) => void;
}) {
  const { t } = useCopy();
  const data = episode.decisions;
  const max = Math.max(1, ...data.map((d) => d.timestamp_ms));
  return (
    <Panel title={t.timeline} className="nx-timeline">
      <svg viewBox="0 0 900 220" role="img" aria-label={t.timeline} className="nx-chart">
        <line x1="48" y1="172" x2="872" y2="172" className="nx-axis" />
        {[0, 0.25, 0.5, 0.75, 1].map((n) => (
          <g key={n}>
            <line x1={48 + 824 * n} x2={48 + 824 * n} y1="24" y2="172" className="nx-grid" />
            <text x={48 + 824 * n} y="196" textAnchor="middle" className="nx-axis-label">
              {format(max * n, 0)} ms
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = 48 + (824 * d.timestamp_ms) / max;
          const y = 60 + (i % 3) * 36;
          return (
            <g
              key={i}
              className="nx-click"
              onMouseEnter={() => onCursor(i)}
              onClick={() => onCursor(i)}
              tabIndex={0}
              role="button"
              aria-label={`${d.sequence} ${d.action} ${d.status}`}
              onFocus={() => onCursor(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCursor(i);
              }}
            >
              <title>{`${d.action}: ${d.status}; ${d.timestamp_ms} ms; ${d.reason}`}</title>
              <line
                x1={x}
                x2={x}
                y1={y}
                y2="172"
                className={i === cursor ? 'nx-accent' : 'nx-axis'}
              />
              <circle
                cx={x}
                cy={y}
                r={i === cursor ? 9 : 6}
                className={
                  d.status === 'denied' || d.status === 'failed'
                    ? 'nx-node-bad'
                    : d.status.includes('unknown')
                      ? 'nx-node-warn'
                      : 'nx-node'
                }
              />
              {(i === cursor || i % Math.max(1, Math.ceil(data.length / 9)) === 0) && (
                <text
                  x={Math.min(823, Math.max(80, x))}
                  y={y - 15}
                  textAnchor="middle"
                  className="nx-label"
                >
                  {d.action.length > 23 ? d.action.slice(0, 21) + '...' : d.action}
                </text>
              )}
            </g>
          );
        })}
        {data[cursor] && (
          <line
            x1={48 + (824 * data[cursor].timestamp_ms) / max}
            x2={48 + (824 * data[cursor].timestamp_ms) / max}
            y1="20"
            y2="178"
            className="nx-cursor"
          />
        )}
      </svg>
      <Readout decision={data[cursor]} />
    </Panel>
  );
}
export function Readout({ decision }: { decision?: Decision }) {
  const { t } = useCopy();
  return (
    <div className="nx-readout" aria-live="polite">
      <span>
        {t.decision} <b>{decision?.sequence ?? '--'}</b>
      </span>
      <span>
        {t.time} <b>{format(decision?.timestamp_ms)} ms</b>
      </span>
      <span>
        {t.selected} <b>{decision?.action ?? '--'}</b>
      </span>
      <span>
        {t.status} <b>{decision?.status ?? '--'}</b>
      </span>
    </div>
  );
}
export function Series({
  episode,
  cursor,
  onCursor,
  field,
  title,
  color = 'accent',
  unit = '',
  accessor,
}: {
  episode: Episode;
  cursor: number;
  onCursor: (n: number) => void;
  field: keyof Decision;
  title: string;
  color?: string;
  unit?: string;
  accessor?: (d: Decision) => unknown;
}) {
  const values = episode.decisions.map((d) => {
    const value = accessor ? accessor(d) : d[field];
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  });
  const present = values.filter((n): n is number => n !== undefined);
  const min = Math.min(0, ...present);
  const max = Math.max(1, ...present);
  const scale = (value: number) => (value - min) / (max - min);
  const { t } = useCopy();
  return (
    <Panel title={title}>
      <svg viewBox="0 0 640 200" className="nx-chart" role="img" aria-label={title}>
        <line x1="40" x2="620" y1="162" y2="162" className="nx-axis" />
        {[0, 0.5, 1].map((n) => (
          <g key={n}>
            <line x1="40" x2="620" y1={162 - 130 * n} y2={162 - 130 * n} className="nx-grid" />
            <text x="34" y={166 - 130 * n} textAnchor="end" className="nx-axis-label">
              {format(min + (max - min) * n)}
            </text>
          </g>
        ))}
        {values.map((v, i) =>
          v === undefined ? null : (
            <g
              key={i}
              tabIndex={0}
              role="button"
              aria-label={`${title} ${i}: ${v} ${unit}`}
              onFocus={() => onCursor(i)}
              onMouseEnter={() => onCursor(i)}
              onClick={() => onCursor(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCursor(i);
              }}
            >
              {i > 0 && values[i - 1] !== undefined && (
                <line
                  x1={40 + (580 * (i - 1)) / Math.max(1, values.length - 1)}
                  x2={40 + (580 * i) / Math.max(1, values.length - 1)}
                  y1={162 - 130 * scale(values[i - 1]!)}
                  y2={162 - 130 * scale(v)}
                  className={`nx-line nx-${color}`}
                />
              )}
              <circle
                cx={40 + (580 * i) / Math.max(1, values.length - 1)}
                cy={162 - 130 * scale(v)}
                r={i === cursor ? 6 : 4}
                className={`nx-node nx-${color}`}
              >
                <title>{`${i}: ${format(v)} ${unit}`}</title>
              </circle>
            </g>
          ),
        )}
        <text x="330" y="193" textAnchor="middle" className="nx-axis-label">
          {t.decision}
        </text>
        {!present.length && (
          <text x="330" y="100" textAnchor="middle" className="nx-label">
            {t.noResult}
          </text>
        )}
      </svg>
      <div className="nx-readout">
        <span>
          {t.decision} <b>{cursor}</b>
        </span>
        <span>
          {title}{' '}
          <b>
            {format(values[cursor])} {unit}
          </b>
        </span>
      </div>
    </Panel>
  );
}
export function CandidatePlot({ decision }: { decision?: Decision }) {
  const { t } = useCopy();
  const candidates = decision?.candidates ?? [];
  const probabilistic = candidates.some((c) => typeof c.probability === 'number');
  const scores = candidates
    .map((c) => c.score)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  const lower = probabilistic ? 0 : Math.min(0, ...scores);
  const upper = probabilistic ? 1 : Math.max(1, ...scores);
  return (
    <Panel title={probabilistic ? t.probabilities : t.confidence}>
      <div className="nx-bars">
        {candidates.map((c, i) => {
          const n = probabilistic ? c.probability : c.score;
          return (
            <div
              className={`nx-bar-row ${c.action === decision?.action ? 'nx-selected' : ''}`}
              key={i}
              tabIndex={0}
              title={`${c.action}: ${format(n, 4)}; ${c.reason ?? ''}`}
            >
              <code>{c.action}</code>
              <div className="nx-bar-track">
                <i
                  style={{
                    width: `${Math.max(0, Math.min(100, (((n ?? lower) - lower) / (upper - lower)) * 100))}%`,
                    background: c.allowed ? 'var(--color-accent)' : 'var(--color-bad)',
                  }}
                />
              </div>
              <b>{format(n, 3)}</b>
              <span>{c.allowed ? t.allowed : t.denied}</span>
            </div>
          );
        })}
      </div>
      <p className="nx-caption">{probabilistic ? t.probability : t.scoreNotice}</p>
      {!probabilistic && (
        <p className="nx-caption">
          {t.noProbability} [{format(lower)}, {format(upper)}]
        </p>
      )}
    </Panel>
  );
}
export function ResourceGraph({ episode, decision }: { episode: Episode; decision?: Decision }) {
  const { t } = useCopy();
  const snapshots = decision?.detail?.resources;
  const resources = (Array.isArray(snapshots) ? snapshots : episode.resources) as Resource[];
  const items = resources.slice(0, 6);
  return (
    <Panel title={t.graph}>
      <svg className="nx-chart nx-graph" viewBox="0 0 840 310" role="img" aria-label={t.graph}>
        <defs>
          <marker
            id="resource-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6" className="nx-marker" />
          </marker>
        </defs>
        <rect x="310" y="20" width="220" height="54" rx="10" className="nx-graph-controller" />
        <text x="420" y="43" textAnchor="middle" className="nx-label">
          {episode.method_id} / {decision?.action ?? t.ready}
        </text>
        <text x="420" y="61" textAnchor="middle" className="nx-axis-label">
          {t.version} {decision?.resource_version ?? '--'}
        </text>
        {items.map((r, i) => {
          const cols = Math.min(3, items.length);
          const x = 20 + (i % 3) * 270;
          const y = 130 + Math.floor(i / 3) * 95;
          return (
            <g
              key={r.id}
              tabIndex={0}
              role="img"
              aria-label={`${r.id} ${r.status} version ${r.version}`}
            >
              <title>{JSON.stringify(r, null, 2)}</title>
              <path
                d={`M420,74 L420,96 L${cols === 1 ? 420 : x + 125},96 L${cols === 1 ? 420 : x + 125},${y}`}
                className="nx-edge"
                markerEnd="url(#resource-arrow)"
              />
              <rect
                x={cols === 1 ? 295 : x}
                y={y}
                width="250"
                height="76"
                rx="9"
                className="nx-graph-resource"
              />
              <text
                x={cols === 1 ? 420 : x + 125}
                y={y + 23}
                textAnchor="middle"
                className="nx-label"
              >
                {r.id.length > 32 ? `...${r.id.slice(-29)}` : r.id}
              </text>
              <text
                x={cols === 1 ? 420 : x + 125}
                y={y + 43}
                textAnchor="middle"
                className="nx-axis-label"
              >
                {r.status} / v{r.version}
              </text>
              <text
                x={cols === 1 ? 420 : x + 125}
                y={y + 62}
                textAnchor="middle"
                className="nx-axis-label"
              >
                {r.owner ?? t.noResult}
              </text>
            </g>
          );
        })}
        {!items.length && (
          <text x="420" y="180" textAnchor="middle" className="nx-label">
            {t.noResult}
          </text>
        )}
      </svg>
      <div className="nx-table-scroll">
        <table className="nx-table">
          <thead>
            <tr>
              <th>{t.resource}</th>
              <th>{t.version}</th>
              <th>{t.status}</th>
              <th>{t.value}</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.id}</code>
                </td>
                <td>{r.version}</td>
                <td>{r.status}</td>
                <td>
                  <code>{String(r.value ?? '--')}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
export function Coordination({
  episode,
  cursor,
  onCursor,
}: {
  episode: Episode;
  cursor: number;
  onCursor: (n: number) => void;
}) {
  const { t } = useCopy();
  const rows = episode.decisions.filter(
    (d) =>
      d.delegation_id ||
      ['lease', 'release', 'delegate', 'collect', 'wait', 'cancel', 'reconcile'].some((s) =>
        d.action.includes(s),
      ),
  );
  return (
    <Panel title={`${t.delegation} / ${t.contention}`}>
      <svg viewBox="0 0 900 290" className="nx-chart" aria-label={t.coordination} role="img">
        {[t.decision, t.resource, t.delegation].map((s, i) => (
          <g key={s}>
            <text x="16" y={50 + i * 85} className="nx-label">
              {s}
            </text>
            <line x1="150" x2="870" y1={46 + i * 85} y2={46 + i * 85} className="nx-grid" />
          </g>
        ))}
        {rows.map((d, i) => {
          const x = 170 + (i / Math.max(1, rows.length)) * 650;
          const y = d.delegation_id ? 216 : 131;
          return (
            <g
              key={d.sequence}
              tabIndex={0}
              role="button"
              aria-label={d.action}
              onFocus={() => onCursor(episode.decisions.indexOf(d))}
              onMouseEnter={() => onCursor(episode.decisions.indexOf(d))}
              onClick={() => onCursor(episode.decisions.indexOf(d))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCursor(episode.decisions.indexOf(d));
              }}
            >
              <title>{`${d.action}: ${d.reason}`}</title>
              <line x1={x} x2={x + 20} y1="46" y2={y} className="nx-accent nx-line" />
              <circle cx={x + 20} cy={y} r="7" className="nx-node" />
              <text x={x + 20} y={y + 25} textAnchor="middle" className="nx-axis-label">
                {d.action}
              </text>
            </g>
          );
        })}
        {rows.length === 0 && (
          <text x="460" y="170" textAnchor="middle" className="nx-label">
            {t.noResult}
          </text>
        )}
      </svg>
      <Readout decision={episode.decisions[cursor]} />
    </Panel>
  );
}
export function PolicyDiagnostics({
  episode,
  cursor,
  onCursor,
}: {
  episode: Episode;
  cursor: number;
  onCursor: (n: number) => void;
}) {
  const { lang, t } = useCopy();
  const [selected, setSelected] = useState('');
  const keys = Array.from(
    new Set(
      episode.decisions.flatMap((d) =>
        Object.entries(d.detail ?? {})
          .filter(([, v]) => typeof v === 'number')
          .map(([k]) => k),
      ),
    ),
  );
  const preferred: Record<string, string> = {
    M05: 'hidden_norm',
    M06: 'updates',
    M08: 'depth',
    M11: 'expected_incremental_utility',
    M12: 'residual_ema',
  };
  const key = keys.includes(selected)
    ? selected
    : keys.includes(preferred[episode.method_id])
      ? preferred[episode.method_id]
      : keys[0];
  const decision = episode.decisions[cursor];
  const values = Object.entries(decision?.detail ?? {}).filter(
    ([k]) => !['resources', 'probability_evidence'].includes(k),
  );
  const mask = decision?.detail?.action_mask;
  return (
    <>
      <Panel
        title={
          lang === 'en'
            ? 'Policy internals at the selected decision'
            : 'Estado interno de la política en la decisión'
        }
      >
        {keys.length > 0 && (
          <label className="nx-control">
            {t.metric}
            <select value={key} onChange={(e) => setSelected(e.target.value)}>
              {keys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="nx-table-scroll">
          <table className="nx-table">
            <tbody>
              {values.map(([k, v]) => (
                <tr key={k}>
                  <th>
                    <code>{k}</code>
                  </th>
                  <td>
                    <code>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '--')}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Array.isArray(mask) && (
          <div className="nx-mask">
            {mask.map((allowed, i) => (
              <span
                key={i}
                className={allowed ? 'nx-mask-allowed' : 'nx-mask-denied'}
                title={`${i}: ${allowed ? t.allowed : t.denied}`}
              >
                {i}: {allowed ? t.allowed : t.denied}
              </span>
            ))}
          </div>
        )}
        <p className="nx-caption">
          {lang === 'en'
            ? 'Values are emitted diagnostics, not reconstructed explanations. Hidden-state norm summarizes magnitude, not a semantic embedding or a measure of intelligence.'
            : 'Los valores son diagnósticos emitidos, no explicaciones reconstruidas. La norma oculta resume magnitud, no contenido semántico ni inteligencia.'}
        </p>
      </Panel>
      {key && (
        <Series
          episode={episode}
          cursor={cursor}
          onCursor={onCursor}
          field="residual"
          accessor={(d) => d.detail?.[key]}
          title={key}
        />
      )}
    </>
  );
}
