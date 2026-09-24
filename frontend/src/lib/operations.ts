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
  created_at?: number;
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
export interface OperationSummary {
  id: string;
  task: keyof typeof taskLabels;
  variant: string;
  seed: number;
  status: string;
  created_at: number;
  expires_at: number;
  findings: number;
  disposition: string;
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
export const statusLabels: Record<string, { en: string; es: string }> = {
  queued: { en: 'Queued', es: 'En cola' },
  running: { en: 'Running', es: 'En ejecución' },
  cancelling: { en: 'Cancelling', es: 'Cancelando' },
  cancelled: { en: 'Cancelled', es: 'Cancelada' },
  succeeded: { en: 'Verified', es: 'Verificada' },
  failed: { en: 'Failed', es: 'Fallida' },
};
export const findingLabels: Record<string, { en: string; es: string }> = {
  invalid_syntax: { en: 'Invalid source or configuration', es: 'Código o configuración inválidos' },
  invalid_table: { en: 'Invalid table structure', es: 'Estructura de tabla inválida' },
  missing_or_extra_value: { en: 'Missing or extra values', es: 'Valores ausentes o adicionales' },
  duplicate_id: { en: 'Repeated record identifier', es: 'Identificador de registro repetido' },
  unknown_reference: {
    en: 'Reference has no accepted parent',
    es: 'Referencia sin registro aceptado',
  },
  ambiguous_reference: { en: 'Ambiguous reference table', es: 'Tabla de referencia ambigua' },
  unchecked_reference: {
    en: 'Reference could not be checked',
    es: 'No se pudo comprobar la referencia',
  },
  missing_dependency: { en: 'Missing prerequisite job', es: 'Falta una tarea requerida' },
  blocked_dependency_graph: {
    en: 'Blocked task dependencies',
    es: 'Dependencias de tareas bloqueadas',
  },
  invalid_workflow: { en: 'Invalid workflow declaration', es: 'Declaración de flujo inválida' },
  digest_mismatch: {
    en: 'File differs from its declared hash',
    es: 'El archivo difiere de su huella declarada',
  },
  missing_file: { en: 'Declared file is missing', es: 'Falta un archivo declarado' },
  unlisted_file: { en: 'File absent from the manifest', es: 'Archivo ausente del manifiesto' },
  invalid_manifest: { en: 'Invalid release manifest', es: 'Manifiesto de entrega inválido' },
};
export const activeRun = (run?: OperationRun | null) =>
  Boolean(run && ['queued', 'running', 'cancelling'].includes(run.status));
export function operationOutcome(run?: OperationRun | null) {
  if (!run?.result) return 'pending';
  if (run.status !== 'succeeded' || run.result.disposition === 'incomplete') return 'incomplete';
  return run.result.disposition === 'checks_passed' && run.result.findings.length === 0
    ? 'passed'
    : 'attention';
}
export class OperationError extends Error {
  constructor(
    public status: number,
    detail: string,
  ) {
    super(detail);
  }
}
export async function operationAPI(path: string, body?: unknown, method?: string): Promise<any> {
  const token = localSession.operationToken;
  const response = await fetch(`/operations-api/${path}`, {
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    headers: {
      'Content-Type': 'application/json',
      'X-Neuraxis-Client': 'operations-v1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).detail ?? '';
    } catch {
      /* Host may not have an operation service. */
    }
    if (response.status === 401 && localSession.operationToken === token)
      localSession.operationToken = undefined;
    throw new OperationError(
      response.status,
      `HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }
  return response.json();
}
export async function ensureOperationSession() {
  if (localSession.operationToken) {
    try {
      await operationAPI('runs');
    } catch (e) {
      if (!(e instanceof OperationError) || e.status !== 401) throw e;
    }
  }
  if (!localSession.operationToken)
    localSession.operationToken = (await operationAPI('session', {})).token;
}
export async function exportOperation(run: OperationRun) {
  const r = await fetch(`/operations-api/runs/${run.id}/export`, {
    headers: { Authorization: `Bearer ${localSession.operationToken}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new OperationError(r.status, `Export HTTP ${r.status}`);
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `neuraxis-${run.id}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function saveCachedOperation(run: OperationRun) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `neuraxis-${run.id}-cached.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function fileSummary(files: InputFile[]) {
  return {
    count: files.length,
    bytes: files.reduce((n, f) => n + new TextEncoder().encode(f.content).length, 0),
  };
}
