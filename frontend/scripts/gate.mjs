// The measured gate on this build (caos-shell-gate, ADR-0078): serves dist/ as GitHub Pages does and walks every
// route, tab and view at five sizes, both themes and both languages, and requires Focus mode in the App. The expected brand is the product name from
// product.json, so the gate refuses to measure any other subject. Extra arguments are passed through. Neuraxis' App is a surface
// (a SurfacePage console, not a case workbench), so every run here passes --workbench '' :
//   npm run gate -- --workbench ''                                 (the full run)
//   npm run gate -- --workbench '' --sizes 1280x800 --themes light   (a quick pass while working)
//   npm run gate -- --workbench '' --url https://neuraxis.ml.fasl-work.com   (the deployed origin, after a deploy)
// GATE_OUT moves the report and the captures out of the tree (a temp folder on the data drive).
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStaticHost } from './serve-static-host.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const product = JSON.parse(readFileSync(join(here, '..', '..', 'product.json'), 'utf8'));
const require = createRequire(import.meta.url);
const bin = join(dirname(require.resolve('@fasl-work/caos-app-shell/package.json')), 'bin', 'caos-shell-gate.mjs');
const extra = process.argv.slice(2);
// Neuraxis is a vps product: the site is served with deploy/neuraxis.nginx.tls rules (a path without an extension falls back to
// index.html), not as GitHub Pages does, which is what the shell's --serve answers. So the gate walks dist/ through
// scripts/serve-static-host.mjs, on port 4188 (GATE_PORT), unless --url names a deployed origin.
const own = extra.includes('--url') ? null : await serveStaticHost(join(here, '..', 'dist'), Number(process.env.GATE_PORT || 4188));
const target = own ? ['--url', own.url] : [];
const out = ['--out', process.env.GATE_OUT || join(here, '..', 'gate-output')];
// --require-focus is always in effect (shell 0.14.0, ADR-0070): the App has a live engine and long task views, so it must carry
// Focus mode (G18), and no extra argument turns the requirement off.
const run = spawn(process.execPath, [bin, ...target, '--expect-brand', product.name, '--require-focus', ...out, ...extra], { stdio: 'inherit' });
const code = await new Promise((done) => run.on('exit', (status) => done(status ?? 1)));
await own?.close();
process.exit(code);
