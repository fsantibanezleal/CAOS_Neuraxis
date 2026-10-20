// The gate this build runs (scripts/gate.mjs) is the shell's measured gate on dist/, for an App that is a SurfacePage (the runner
// is invoked with --workbench ''), and --require-focus is always in effect, whatever extra arguments a run passes (shell 0.14.0,
// ADR-0070). Neuraxis' own browser gates and generators live under frontend/scripts/, never at the frontend root.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const frontend = new URL('../', import.meta.url);
const gate = readFileSync(new URL('scripts/gate.mjs', frontend), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('package.json', frontend), 'utf8')) as {
  scripts: Record<string, string>;
};

describe('the gate script', () => {
  it('passes --require-focus before the pass-through arguments, so the requirement cannot be turned off', () => {
    expect(gate).toMatch(/'--require-focus'/);
    expect(gate.indexOf("'--require-focus'")).toBeLessThan(gate.indexOf('...extra'));
  });

  it('adversarial: the runner without the flag, or with the flag after the pass-through arguments, is refused', () => {
    const holds = (source: string) =>
      source.includes("'--require-focus'") &&
      source.indexOf("'--require-focus'") < source.indexOf('...extra');
    expect(holds(gate)).toBe(true);
    expect(holds(gate.replace("'--require-focus', ", ''))).toBe(false);
    expect(
      holds(
        gate.replace("'--require-focus', ...out, ...extra", "...out, ...extra, '--require-focus'"),
      ),
    ).toBe(false);
  });

  it('reads the brand from product.json, writes to GATE_OUT when set, and the npm script runs it', () => {
    expect(gate).toContain('product.json');
    expect(gate).toContain('process.env.GATE_OUT');
    expect(pkg.scripts.gate).toBe('node scripts/gate.mjs');
  });
});

describe('the scripts folder', () => {
  const root = readdirSync(frontend).filter(
    (name) => name.endsWith('.mjs') || name.endsWith('.py'),
  );

  it('no browser gate or generator stays at the frontend root', () => {
    expect(root).toEqual([]);
  });

  it('every browser gate, generator and the disposable server live in frontend/scripts', () => {
    for (const name of [
      'gate.mjs',
      'copy-data.mjs',
      'build-diagrams.mjs',
      'export-theory.mjs',
      'qa-server.py',
      'verify-routes.mjs',
      ...[
        'architecture',
        'benchmark',
        'browser',
        'content',
        'evidence',
        'investigations',
        'layout',
        'missing-file',
        'mobile',
        'native',
        'operation-recovery',
        'operations',
        'recovery',
        'results',
        'tab-navigation',
        'workspace',
      ].map((g) => `verify-${g}.mjs`),
    ]) {
      expect(existsSync(new URL(`scripts/${name}`, frontend)), name).toBe(true);
    }
  });

  it('the package scripts call the moved data copy', () => {
    expect(pkg.scripts.predev).toBe('node scripts/copy-data.mjs');
    expect(pkg.scripts.prebuild).toBe('node scripts/copy-data.mjs');
  });
});
