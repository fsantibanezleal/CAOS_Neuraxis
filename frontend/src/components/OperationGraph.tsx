import { Check, Circle, LoaderCircle, ShieldCheck, X, ArrowDown } from 'lucide-react';
import { useCopy } from '../i18n';
import type { OperationNode } from '../lib/operations';

/** Columns derive from actual prerequisites; buttons remain readable and keyboard operable. */
export default function OperationGraph({
  nodes,
  selected,
  onSelect,
  artifacts = {},
}: {
  nodes: OperationNode[];
  selected: string;
  onSelect: (id: string) => void;
  artifacts?: Record<string, Record<string, unknown>>;
}) {
  const { lang } = useCopy();
  const depth = new Map<string, number>();
  nodes.forEach((n) =>
    depth.set(
      n.id,
      n.depends_on.length ? 1 + Math.max(...n.depends_on.map((d) => depth.get(d) ?? 0)) : 0,
    ),
  );
  const levels = Array.from({ length: 1 + Math.max(0, ...depth.values()) }, (_, i) =>
    nodes.filter((n) => depth.get(n.id) === i),
  );
  return (
    <div
      className="op-graph"
      aria-label={lang === 'en' ? 'Execution dependency graph' : 'Grafo de dependencias'}
    >
      <div className="op-graph-legend">
        <span>
          <i className="op-dot" />
          {lang === 'en' ? 'Registered fast actions' : 'Acciones rápidas registradas'}
        </span>
        <span>
          <ShieldCheck size={13} />
          {lang === 'en' ? 'Every effect verified' : 'Cada efecto verificado'}
        </span>
      </div>
      <div className="op-graph-levels">
        {levels.map((level, i) => (
          <div className="op-graph-level" key={i}>
            <span className="op-stage">
              {String(i + 1).padStart(2, '0')} <ArrowDown size={13} />
            </span>
            <div className="op-graph-nodes">
              {level.map((n) => {
                const artifact = artifacts[n.id];
                const findings = Array.isArray(artifact?.findings) ? artifact.findings.length : 0;
                const measure =
                  artifact &&
                  Object.entries(artifact).find(
                    ([key, value]) =>
                      ['files', 'checks', 'tables', 'outputs', 'jobs', 'parsed'].includes(key) &&
                      typeof value === 'object',
                  );
                const count = measure ? Object.keys(measure[1] as object).length : null;
                return (
                  <button
                    key={n.id}
                    className={`op-node ${selected === n.id ? 'selected' : ''}`}
                    data-state={n.state}
                    onClick={() => onSelect(n.id)}
                    aria-pressed={selected === n.id}
                  >
                    <span className="op-node-symbol">
                      {n.state === 'succeeded' ? (
                        <Check size={18} />
                      ) : n.state === 'running' ? (
                        <LoaderCircle size={18} className="op-spin" />
                      ) : ['failed', 'blocked', 'cancelled'].includes(n.state) ? (
                        <X size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </span>
                    <span>
                      <strong>{n.title[lang]}</strong>
                      <small>
                        {count !== null
                          ? `${count} ${({ files: ['files', 'archivos'], checks: ['checks', 'comprobaciones'], tables: ['tables', 'tablas'], outputs: ['outputs', 'salidas'], jobs: ['jobs', 'tareas'], parsed: ['parsed files', 'archivos analizados'] }[measure![0]] ?? ['records', 'registros'])[lang === 'en' ? 0 : 1]}`
                          : n.output.replace('output/', '')}
                      </small>
                      {artifact && (
                        <small className={findings ? 'op-node-attention' : ''}>
                          {findings
                            ? `${findings} ${lang === 'en' ? (findings === 1 ? 'finding' : 'findings') : findings === 1 ? 'hallazgo' : 'hallazgos'}`
                            : lang === 'en'
                              ? 'Evidence recorded'
                              : 'Evidencia registrada'}
                        </small>
                      )}
                    </span>
                    <span className="op-node-status">
                      {
                        ({
                          pending: ['Pending', 'Pendiente'],
                          running: ['Working', 'En curso'],
                          succeeded: ['Verified', 'Verificado'],
                          failed: ['Failed', 'Falló'],
                          blocked: ['Blocked', 'Bloqueado'],
                          cancelled: ['Cancelled', 'Cancelado'],
                        }[n.state] ?? [n.state, n.state])[lang === 'en' ? 0 : 1]
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
