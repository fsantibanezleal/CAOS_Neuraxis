// The documentation renderer on the shell 0.15 areas (ADR-0017 sections 2.1 and 4): the Introduction opens on the executive view
// and holds the five areas in its technical view; every section renders as a DocSection with its area (a method with its kind);
// no page has a Bibliography tab or a per-section references row, so the references are the shell's one block at the end of the
// page or open topic. The block itself is drawn in an effect, which a server render does not run: the gate measures it
// (`npm run gate`, check ADR-0017.2 and the end-of-topic rule), this keeps the markup it is drawn from.
import { readFileSync } from 'node:fs';
import { CitationsProvider } from '@fasl-work/caos-app-shell';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import executive from '../../../content/executive.json';
import { CITATIONS } from '../data/citations';
import { experiments } from '../data/experiments';
import { implementation } from '../data/implementation';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';
import { IntroductionPage } from './Introduction';
import Science, { SectionContent } from './Science';

const wrap = (node: ReactNode) =>
  renderToString(
    <MemoryRouter>
      <CitationsProvider items={CITATIONS}>{node}</CitationsProvider>
    </MemoryRouter>,
  );
const text = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');

describe('the Introduction: two views, the executive first', () => {
  it('opens on the executive view: two tabs, executive then technical, the first selected', () => {
    const html = wrap(<IntroductionPage data={executive} base="/" />);
    const tabs = [...html.matchAll(/data-tab="([a-z]+)"/g)].map((m) => m[1]);
    expect(tabs.slice(0, 2)).toEqual(['executive', 'technical']);
    expect(html).toMatch(/aria-selected="true"[^>]*class="tab active"[^>]*data-tab="executive"/);
    expect(html).toContain('data-panel="executive"');
    expect(html).toContain('data-executive-view');
  });

  it('refutes: no equation, glossary or section is in the page while the executive view is open', () => {
    const html = wrap(<IntroductionPage data={executive} base="/" />);
    expect(html).not.toContain('data-glossary');
    expect(html).not.toContain('class="equation');
    expect(html).not.toContain('data-doc-section');
    expect(html).not.toContain('data-area');
  });

  it('the technical view lists the five areas as its topics and opens on the first', () => {
    const html = wrap(<IntroductionPage data={executive} base="/" initial="technical" />);
    expect(html).toContain('data-panel="technical"');
    expect(html).not.toContain('data-executive-view');
    for (const s of introduction.sections) expect(html).toContain(`data-tab="${s.id}"`);
    expect(html).toContain('data-area="problem"');
  });

  it('each technical section renders as a DocSection of its area, with the glossary under the mathematics and the steps in the pipeline', () => {
    const area = (id: string) =>
      wrap(<SectionContent section={introduction.sections.find((s) => s.id === id)!} />);
    for (const s of introduction.sections) expect(area(s.id)).toContain(`data-area="${s.area}"`);
    expect(area('formal')).toContain('data-glossary');
    expect((area('formal').match(/<dt>/g) ?? []).length).toBeGreaterThanOrEqual(10);
    expect(area('workflow')).toMatch(/<ol>(?:(?!<\/ol>).)*<li>/);
    expect(area('honesty').match(/data-callout="honest"/g)?.length).toBe(1);
  });

  it('the route renders the Introduction page, not the generic Science renderer', () => {
    const app = text('../App.tsx');
    expect(app).toMatch(/import Introduction from '\.\/pages\/Introduction'/);
    expect(app).not.toMatch(/<Science page=\{introduction\}/);
  });
});

describe('the documentation pages end in one references block and have no Bibliography tab', () => {
  it('no page has a Bibliography tab, and the renderer draws no per-section references row', () => {
    const science = text('./Science.tsx');
    expect(science).not.toMatch(/bibliography|Bibliograf/i);
    expect(science).not.toMatch(/<Refs\b/);
    for (const page of [methodology, implementation, experiments]) {
      const html = wrap(<Science page={page} />);
      expect(html).not.toMatch(/Bibliography|Bibliograf/i);
      expect(html).not.toContain('th-refs');
      expect(html).toContain('data-doc-page');
    }
  });

  it('every section renders as a DocSection with its area, a method with its kind, and registers its references', () => {
    for (const page of [methodology, implementation, experiments]) {
      for (const s of page.sections) {
        const html = wrap(<SectionContent section={s} />);
        expect(html, s.id).toContain(`data-area="${s.area}"`);
        expect(html, s.id).toContain('data-doc-section');
        expect(html, s.id).toMatch(/data-refs="\d+"/);
        if (s.kind) expect(html, s.id).toContain(`data-method-kind="${s.kind}"`);
      }
    }
  });

  it('refutes: nothing a section rendered before is missing (paragraphs, equations, figure, steps, table, callout)', () => {
    for (const page of [introduction, methodology, implementation, experiments]) {
      for (const s of page.sections) {
        const html = wrap(<SectionContent section={s} />);
        expect(
          html.match(/class="measure"/g)?.length ?? 0,
          `${s.id} paragraphs`,
        ).toBeGreaterThanOrEqual(s.paragraphs.length);
        expect(html.match(/class="equation"/g)?.length ?? 0, `${s.id} equations`).toBe(
          s.equations.length,
        );
        expect(html, `${s.id} figure`).toContain('<figcaption>');
        expect(
          (html.match(/<tr>/g) ?? []).length >= (s.table ? s.table.rows.length + 1 : 0),
          `${s.id} table`,
        ).toBe(true);
        for (const step of s.steps ?? [])
          expect(html, `${s.id} step`).toContain(
            step.en.replace(/'/g, '&#x27;').replace(/’/g, '’'),
          );
        expect(html, `${s.id} callout`).toContain('callout');
      }
    }
  });

  it('a method section carries exactly one honest callout: its limit (the measured-evidence finding is a note)', () => {
    const evidence = text('../components/ScientificEvidence.tsx');
    const methodEvidence = evidence.slice(
      evidence.indexOf('export function MethodEvidence'),
      evidence.indexOf('type StudyRow'),
    );
    expect(methodEvidence).not.toMatch(/variant="honest"/);
    expect(methodEvidence).toMatch(/variant="note"/);
  });
});
