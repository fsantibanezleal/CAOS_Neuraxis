import { describe, expect, it } from 'vitest';
import { CITATIONS } from './citations';

describe('publication citations', () => {
  it('uses the stable concept DOI for the latest technical report version', () => {
    const report = CITATIONS.find((citation) => citation.id === 'neuraxisreport2026');
    expect(report?.doi).toBe('10.5281/zenodo.23765413');
  });
});
