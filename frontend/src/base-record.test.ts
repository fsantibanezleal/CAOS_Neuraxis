// The product's record of the base it follows (ADR-0078): identity, template release, deploy place, one version source.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deployPlaceProblems, templateRecordProblems } from './base-record.checks';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('the base record', () => {
  it('product.json names the product, bilingual tagline included', () => {
    const product = JSON.parse(read('product.json')) as Record<string, unknown> & {
      tagline: Record<string, string>;
    };
    for (const key of [
      'name',
      'slug',
      'tagline',
      'repo',
      'visibility',
      'license',
      'holder',
      'year',
    ]) {
      expect(product).toHaveProperty(key);
    }
    expect(product.name).toBe('Neuraxis');
    expect(product.visibility).toBe('private');
    expect(Object.keys(product.tagline).sort()).toEqual(['en', 'es']);
  });

  it('.template-version records the template release in the template format', () => {
    expect(templateRecordProblems(read('.template-version'))).toEqual([]);
  });

  it('deploy/TARGET is the one deploy place', () => {
    expect(
      deployPlaceProblems(
        read('deploy/TARGET'),
        readdirSync(new URL('../../deploy/', import.meta.url)),
      ),
    ).toEqual([]);
  });

  it('the frontend version follows VERSION and the shell is pinned exactly', () => {
    const [major, minor, patch] = read('VERSION').trim().split('.').map(Number);
    const pkg = JSON.parse(read('frontend/package.json')) as {
      version: string;
      dependencies: Record<string, string>;
    };
    expect(pkg.version).toBe(`${major}.${minor}.${patch}`);
    expect(pkg.dependencies['@fasl-work/caos-app-shell']).toBe('0.15.0');
  });
});
