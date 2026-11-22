import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// frontend/src/architecture is the canonical, hand-authored diagram set. The public copies support
// repository documentation; they are byte-for-byte mirrors, never a second source of diagram content.
const source = fileURLToPath(new URL('./src/architecture/', import.meta.url));
const destination = fileURLToPath(new URL('./public/svg/tech/', import.meta.url));
const names = [
  '01-the-app.svg',
  '02-lanes.svg',
  '03-web-flow.svg',
  '04-the-science.svg',
  '05-data-contracts.svg',
];

mkdirSync(destination, { recursive: true });
for (const name of names) copyFileSync(`${source}${name}`, `${destination}${name}`);
