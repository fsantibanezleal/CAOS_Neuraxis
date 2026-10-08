import { useEffect, useRef } from 'react';
import { Callout, Cite, DocPage, Equation, Refs, DocSection } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import type { ContentPage, ContentSection } from '../data/content.types';
import type { Bilingual } from '../lib/types';
import ScientificFigure from '../components/ScientificFigure';
import { paragraphSources } from '../data/paragraph-sources';
import { MethodEvidence, OperationStudy } from '../components/ScientificEvidence';
import OverflowTabs, { OverflowSubTabs } from '../components/OverflowTabs';

type SectionGroup = { id: string; label: Bilingual; sections: string[] };

const groupsByPage: Record<string, SectionGroup[]> = {
  Introduction: [
    {
      id: 'foundations',
      label: { en: 'Foundations', es: 'Fundamentos' },
      sections: ['problem', 'biology', 'formal'],
    },
    {
      id: 'practice',
      label: { en: 'Using Neuraxis', es: 'Uso de Neuraxis' },
      sections: ['workflow', 'honesty'],
    },
  ],
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
      sections: ['browser', 'pipeline', 'deployment'],
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
export function SectionContent({ section }: { section: ContentSection }) {
  const { lang, t } = useCopy();
  const article = useRef<HTMLElement>(null);
  const sourceIds = [...new Set([...section.refs, ...(paragraphSources[section.id] ?? []).flat()])];
  useEffect(() => {
    if (article.current && article.current.getBoundingClientRect().top < 0) {
      article.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [section.id]);
  return (
    <article ref={article} className="nx-doc-section">
      <h2>{section.title[lang]}</h2>
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
      {section.symbols && (
        <ul className="nx-doc-symbols">
          {section.symbols.map((s, i) => (
            <li key={i}>{s[lang]}</li>
          ))}
        </ul>
      )}
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
      <Refs ids={sourceIds} label={t.refs} />
    </article>
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
      content: <OperationStudy />,
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
  tabs.push({
    id: 'bibliography',
    label: lang === 'en' ? 'Bibliography' : 'Bibliografía',
    content: (
      <div>
        {page.sections.map((section) => (
          <DocSection
            key={section.id}
            title={section.title}
            refs={[...new Set([...section.refs, ...(paragraphSources[section.id] ?? []).flat()])]}
          >
            <p>{section.paragraphs[0]?.[lang]}</p>
          </DocSection>
        ))}
      </div>
    ),
  });
  return (
    <DocPage title={page.title} lede={page.lede[lang]} wide>
      <OverflowTabs key={page.title.en} ariaLabel={t.content} tabs={tabs} />
    </DocPage>
  );
}
