import { useEffect, useRef } from 'react';
import { Callout, Cite, DocPage, Equation, DocSection, Glossary } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import type { ContentPage, ContentSection } from '../data/content.types';
import type { Bilingual } from '../lib/types';
import ScientificFigure from '../components/ScientificFigure';
import { paragraphSources } from '../data/paragraph-sources';
import { MethodEvidence, OperationStudy } from '../components/ScientificEvidence';
import OverflowTabs, { OverflowSubTabs } from '../components/OverflowTabs';

type SectionGroup = { id: string; label: Bilingual; sections: string[] };

const areaByPage: Record<string, Record<string, string>> = {
  Introduction: {
    problem: 'problem',
    biology: 'principles',
    formal: 'math',
    workflow: 'pipeline',
    honesty: 'honesty',
  },
  Methodology: {
    exact: 'method',
    supervised: 'method',
    sequential: 'method',
    modelbased: 'method',
    slow: 'method',
    metacontrol: 'method',
  },
  Implementation: {
    runtime: 'architecture',
    features: 'contract',
    classical: 'engine',
    recurrent: 'engine',
    planning: 'engine',
    browser: 'lanes',
    pipeline: 'reproducibility',
    deployment: 'deployment',
  },
  Experiments: {
    design: 'question',
    splits: 'protocol',
    metrics: 'metrics',
    robustness: 'protocol',
    ablations: 'metrics',
    data: 'datasets',
  },
};

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
export function SectionContent({
  section,
  pageTitle,
}: {
  section: ContentSection;
  pageTitle: string;
}) {
  const { lang, t } = useCopy();
  const article = useRef<HTMLElement>(null);
  const sourceIds = [...new Set([...section.refs, ...(paragraphSources[section.id] ?? []).flat()])];
  useEffect(() => {
    if (article.current && article.current.getBoundingClientRect().top < 0) {
      article.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [section.id]);
  const area = areaByPage[pageTitle]?.[section.id];
  if (!area) throw new Error(`Missing ADR-0017 area for ${pageTitle}/${section.id}`);
  const references = sourceIds.length
    ? { refs: sourceIds }
    : {
        noRefsReason: {
          en: 'This section reports product implementation or measured evidence and makes no external claim.',
          es: 'Esta sección informa implementación o evidencia medida del producto, sin afirmaciones externas.',
        },
      };
  return (
    <DocSection
      title={section.title}
      id={section.id}
      area={area}
      kind={section.kind}
      {...references}
    >
      <article ref={article} className="nx-doc-section">
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
        {section.glossary && (
          <Glossary
            ariaLabel={{ en: 'State and control glossary', es: 'Glosario de estado y control' }}
            entries={section.glossary}
          />
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
        <Callout variant={section.id === 'metacontrol' ? 'note' : 'honest'} title={t.assumptions}>
          {section.limit[lang]}
        </Callout>
        {['exact', 'supervised', 'sequential', 'modelbased', 'slow', 'metacontrol'].includes(
          section.id,
        ) && <MethodEvidence section={section.id} />}
      </article>
    </DocSection>
  );
}
export default function Science({
  page,
  embedded = false,
}: {
  page: ContentPage;
  embedded?: boolean;
}) {
  const { lang, t } = useCopy();
  const sections = page.sections.map((s) => ({
    id: s.id,
    label: s.title[lang],
    content: <SectionContent section={s} pageTitle={page.title.en} />,
  }));
  if (page.title.en === 'Experiments')
    sections.push({
      id: 'compound',
      label: lang === 'en' ? 'Compound task study' : 'Estudio de tareas compuestas',
      content: (
        <DocSection
          title={{ en: 'Compound task study', es: 'Estudio de tareas compuestas' }}
          id="compound"
          area="datasets"
          refs={['neuraxis2026']}
        >
          <OperationStudy />
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
  const content = <OverflowTabs key={page.title.en} ariaLabel={t.content} tabs={tabs} />;
  return embedded ? (
    content
  ) : (
    <DocPage title={page.title} lede={page.lede[lang]}>
      {content}
    </DocPage>
  );
}
