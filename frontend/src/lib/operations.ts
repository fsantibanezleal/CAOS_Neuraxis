import { localSession } from './session';
export interface InputFile {
  path: string;
  content: string;
}
export interface Finding {
  code: string;
  path: string;
  message: string;
  severity: string;
  line: number | null;
  expected?: string;
  actual?: string;
}
export interface OperationNode {
  id: string;
  title: { en: string; es: string };
  depends_on: string[];
  output: string;
  state: string;
  error?: string;
  history?: Record<string, unknown>[];
  evidence?: Record<string, unknown>;
}
export interface OperationResult {
  status: string;
  disposition: string;
  findings: Finding[];
  nodes: OperationNode[];
  artifacts: Record<string, Record<string, unknown>>;
  metrics: {
    wall_ms: number;
    files: number;
    verified_nodes: number;
    native_receipts: number;
    model_calls: number;
    journal_sequence: number;
  };
  input_sha256: string;
  engine: string;
  scope: string;
}
export interface OperationRun {
  id: string;
  task: string;
  variant: string;
  seed: number;
  status: string;
  nodes: OperationNode[];
  events: Record<string, unknown>[];
  inputs: InputFile[];
  result: OperationResult | null;
  error: string | null;
}
export const taskLabels = {
  release: { en: 'Verify a software release', es: 'Verificar una entrega de software' },
  source: { en: 'Audit a source workspace', es: 'Auditar un proyecto de código' },
  data: { en: 'Reconcile a data delivery', es: 'Conciliar una entrega de datos' },
};
export const conditionLabels: Record<string, { en: string; es: string }> = {
  clean: { en: 'Clean delivery', es: 'Entrega válida' },
  corrupt: { en: 'Corrupted files & records', es: 'Archivos y registros dañados' },
  conflict: { en: 'Conflicting IDs & dependencies', es: 'Conflictos de IDs y dependencias' },
  compound: { en: 'Combined incident', es: 'Incidente combinado' },
};
export const activeRun = (run?: OperationRun | null) =>
  Boolean(run && ['queued', 'running', 'cancelling'].includes(run.status));
export async function operationAPI(path: string, body?: unknown, method?: string): Promise<any> {
  const response = await fetch(`/operations-api/${path}`, {
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    headers: {
      'Content-Type': 'application/json',
      'X-Neuraxis-Client': 'operations-v1',
      ...(localSession.operationToken
        ? { Authorization: `Bearer ${localSession.operationToken}` }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).detail ?? '';
    } catch {
      /* Host may not have an operation service. */
    }
    throw new Error(`HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return response.json();
}
export async function ensureOperationSession() {
  if (!localSession.operationToken)
    localSession.operationToken = (await operationAPI('session', {})).token;
}
export async function exportOperation(run: OperationRun) {
  const r = await fetch(`/operations-api/runs/${run.id}/export`, {
    headers: { Authorization: `Bearer ${localSession.operationToken}` },
  });
  if (!r.ok) throw new Error(`Export HTTP ${r.status}`);
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `neuraxis-${run.id}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function fileSummary(files: InputFile[]) {
  return {
    count: files.length,
    bytes: files.reduce((n, f) => n + new TextEncoder().encode(f.content).length, 0),
  };
}
