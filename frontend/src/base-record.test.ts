// The product's record of the base it follows (ADR-0078): identity, template release, deploy place, one version source.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** The checks of BR-005, exported so the planted-defect suite runs the gate's own functions. */
export const templateRecordProblems = (text: string): string[] =>
  /^CAOS_PRODUCT_TEMPLATE (\d+\.\d{2}\.\d{3}) \(tag v\1\)$/.test(text.trim())
    ? []
    : ['.template-version is not in the template format'];
export const deployPlaceProblems = (target: string, deployFiles: string[]): string[] => {
  const out: string[] = [];
  if (target.trim() !== 'vps')
    out.push(`deploy/TARGET is "${target.trim().replace(/\n/g, ' / ')}", not the one place vps`);
  if (deployFiles.filter((f) => /^TARGET/i.test(f)).length !== 1)
    out.push('more than one deploy place file');
  return out;
};

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
