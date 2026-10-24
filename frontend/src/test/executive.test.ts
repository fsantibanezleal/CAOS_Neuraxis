import { describe, expect, it } from 'vitest';
import { validateExecutive } from '@fasl-work/caos-app-shell';
import executive from '../../../content/executive.json';

describe('executive introduction', () => {
  it('matches the shared shell contract and cites its evidence', () => {
    expect(validateExecutive(executive)).toEqual([]);
    expect(executive.sources.length).toBeGreaterThanOrEqual(3);
    expect(executive.headline_figures.length).toBeGreaterThanOrEqual(3);
  });
});
