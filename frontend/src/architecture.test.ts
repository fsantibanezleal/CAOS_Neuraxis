import { expect, it } from 'vitest';
import { validateArchitectureConfig } from '@fasl-work/caos-app-shell';
import { architecture } from './architecture';

it('provides inline bilingual architecture compatible with the published shell', () => {
  expect(validateArchitectureConfig(architecture)).toEqual([]);
});
