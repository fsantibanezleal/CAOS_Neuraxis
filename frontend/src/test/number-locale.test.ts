import { afterEach, expect, it } from 'vitest';
import { useLangStore } from '@fasl-work/caos-app-shell';
import { format, formatFixed } from '../components/Instruments';

afterEach(() => useLangStore.setState({ lang: 'en' }));

it('formats measured values using the selected app language', () => {
  useLangStore.setState({ lang: 'en' });
  expect(format(14400, 0)).toBe('14,400');
  expect(formatFixed(117.1, 1)).toBe('117.1');
  useLangStore.setState({ lang: 'es' });
  expect(format(14400, 0)).toBe('14.400');
  expect(formatFixed(117.1, 1)).toBe('117,1');
});
