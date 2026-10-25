import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const shell = require.resolve('@fasl-work/caos-app-shell/package.json');
const bin = join(dirname(shell), 'bin', 'caos-shell-gate.mjs');
const output = process.env.NEURAXIS_GATE_OUTPUT ?? join(tmpdir(), 'neuraxis-shell-gate');
const args = [
  '--serve', join(here, 'dist'),
  '--spa-fallback',
  '--expect-brand', 'Neuraxis',
  '--workbench', '',
  '--app-route', '/app',
  '--out', output,
  ...process.argv.slice(2),
];
const run = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit' });
process.exit(run.status ?? 1);
