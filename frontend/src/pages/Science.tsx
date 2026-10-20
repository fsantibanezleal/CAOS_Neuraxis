import { useEffect, useRef } from 'react';
import { Callout, Cite, DocPage, DocSection, Equation, Glossary } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import type { ContentPage, ContentSection } from '../data/content.types';
import type { Bilingual } from '../lib/types';
import ScientificFigure from '../components/ScientificFigure';
import { paragraphSources } from '../data/paragraph-sources';
import { MethodEvidence, OperationStudy } from '../components/ScientificEvidence';
import OverflowTabs, { OverflowSubTabs } from '../components/OverflowTabs';

type SectionGroup = { id: string; label: Bilingual; sections: string[] };

const groupsByPage: Record<string, SectionGroup[]> = {
  Methodology: [
    {
      id: 'fast',
      label: { en: 'Fast control', es: 'Control rápido' },
      sections: ['exact', 'supervised', 'sequential', 'modelbased'],
    },
    {
      id: 'coordination',
      label: { en: 'Slow coordination', es: 'Coordinación lenta' },
      sections: ['slow', 'metacontrol'],
    },
  ],
  Implementation: [
    {
      id: 'runtime',
      label: { en: 'Execution boundary', es: 'Límite de ejecución' },
      sections: ['runtime', 'features'],
    },
    {
      id: 'engines',
      label: { en: 'Policy engines', es: 'Motores de políticas' },
      sections: ['classical', 'recurrent', 'planning'],
    },
    {
      id: 'product',
      label: { en: 'Product and evidence', es: 'Producto y evidencia' },
      sections: ['browser', 'pipeline', 'deployment', 'reproducibility'],
    },
  ],
  Experiments: [
    {
      id: 'protocol',
      label: { en: 'Study protocol', es: 'Protocolo de estudio' },
      sections: ['design', 'splits', 'metrics'],
    },
    {
      id: 'tests',
      label: { en: 'Stress and ablation', es: 'Estrés y ablación' },
      sections: ['robustness', 'ablations'],
    },
    {
      id: 'evidence',
      label: { en: 'Evidence and tasks', es: 'Evidencia y tareas' },
      sections: ['data', 'compound'],
    },
  ],
};
/** A symbol line "term: definition" of a section's data as the glossary entry the shell counts (a term and a definition, both languages). */
export function glossaryEntries(
  symbols: Bilingual[],
): { term: Bilingual; definition: Bilingual }[] {
  const split = (text: string) => {
    const at = text.indexOf(': ');
    return at < 0
      ? { term: text, definition: text }
      : { term: text.slice(0, at), definition: text.slice(at + 2) };
  };
  return symbols.map((s) => ({
    term: { en: split(s.en).term, es: split(s.es).term },
    definition: { en: split(s.en).definition, es: split(s.es).definition },
  }));
}
/** The sources a section cites: its own list and every paragraph's attribution, each once. */
const sourcesOf = (section: ContentSection) => [
  ...new Set([...section.refs, ...(paragraphSources[section.id] ?? []).flat()]),
];
/** The compound task study of Experiments is a live view, not a data section: it is a section of the page all the same. */
const COMPOUND = {
  id: 'compound',
  area: 'question',
  title: {
    en: 'Compound tasks: executed files, faults and deliverables',
    es: 'Tareas compuestas: archivos, fallos y entregables ejecutados',
  },
  refs: ['neuraxis2026', 'reflexmesh2026'],
};
/** One section of a documentation page as the shell's DocSection: it declares its area (and, for a method, its kind) and every
 * element the gate counts sits inside it. Its references are registered with the open topic, which lists them once at its end. */
export function SectionContent({ section }: { section: ContentSection }) {
  const { lang, t } = useCopy();
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const top = body.current?.closest('section');
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [section.id]);
  return (
    <DocSection
      id={`doc-${section.id}`}
      title={section.title}
      area={section.area}
      kind={section.kind}
      refs={sourcesOf(section)}
    >
      <div ref={body} className="nx-doc-section">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="measure">
            {p[lang]}{' '}
            {(paragraphSources[section.id]?.[i] ?? []).map((id) => (
              <span key={id}>
                {' '}
                <Cite id={id} />
              </span>
            ))}
          </p>
        ))}
        <ScientificFigure section={section} />
        {section.equations.map((eq, i) => (
          <Equation key={i} tex={eq.tex} caption={eq.caption[lang]} />
        ))}
        {section.symbols && <Glossary entries={glossaryEntries(section.symbols)} />}
        {section.steps && (
          <ol>
            {section.steps.map((s, i) => (
              <li key={i}>{s[lang]}</li>
            ))}
          </ol>
        )}
        {section.table && (
          <div className="nx-table-scroll">
            <table className="nx-table">
              <thead>
                <tr>
                  {section.table.headers.map((h, i) => (
                    <th key={i}>{h[lang]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.table.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c[lang]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Callout variant="honest" title={t.assumptions}>
          {section.limit[lang]}
        </Callout>
        {['exact', 'supervised', 'sequential', 'modelbased', 'slow', 'metacontrol'].includes(
          section.id,
        ) && <MethodEvidence section={section.id} />}
      </div>
    </DocSection>
  );
}
export default function Science({ page }: { page: ContentPage }) {
  const { lang, t } = useCopy();
  const sections = page.sections.map((s) => ({
    id: s.id,
    label: s.title[lang],
    content: <SectionContent section={s} />,
  }));
  if (page.title.en === 'Experiments')
    sections.push({
      id: 'compound',
      label: lang === 'en' ? 'Compound task study' : 'Estudio de tareas compuestas',
      content: (
        <DocSection
          id="doc-compound"
          title={COMPOUND.title}
          area={COMPOUND.area}
          refs={COMPOUND.refs}
        >
          <div className="nx-doc-section">
            <OperationStudy />
          </div>
        </DocSection>
      ),
    });
  const groups = groupsByPage[page.title.en];
  const groupedIds = groups.flatMap((group) => group.sections);
  if (
    groupedIds.length !== sections.length ||
    new Set(groupedIds).size !== sections.length ||
    groupedIds.some((id) => !sections.some((section) => section.id === id))
  ) {
    throw new Error(`Incomplete science navigation for ${page.title.en}`);
  }
  const tabs = groups.map((group) => ({
    id: group.id,
    label: group.label[lang],
    content: (
      <OverflowSubTabs
        ariaLabel={`${page.title[lang]}: ${group.label[lang]}`}
        tabs={group.sections.map((id) => {
          const section = sections.find((item) => item.id === id)!;
          return section;
        })}
      />
    ),
  }));
  return (
    <DocPage title={page.title} lede={page.lede[lang]} wide>
      <OverflowTabs key={page.title.en} ariaLabel={t.content} tabs={tabs} />
    </DocPage>
  );
}
