import { useEffect, useRef } from 'react';
import { Callout, Cite, Equation, Refs, ReferenceList } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import type { ContentPage, ContentSection } from '../data/content.types';
import ScientificFigure from '../components/ScientificFigure';
import { paragraphSources } from '../data/paragraph-sources';
import { MethodEvidence, OperationStudy } from '../components/ScientificEvidence';
import OverflowTabs from '../components/OverflowTabs';
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
      <ReferenceList
        ids={sourceIds}
        heading={lang === 'en' ? 'Section bibliography' : 'Bibliografía de la sección'}
      />
    </article>
  );
}
export default function Science({ page }: { page: ContentPage }) {
  const { lang, t } = useCopy();
  const tabs = page.sections.map((s) => ({
    id: s.id,
    label: s.title[lang],
    content: <SectionContent section={s} />,
  }));
  if (page.title.en === 'Experiments')
    tabs.push({
      id: 'compound',
      label: lang === 'en' ? 'Compound task study' : 'Estudio de tareas compuestas',
      content: <OperationStudy />,
    });
  tabs.push({
    id: 'bibliography',
    label: lang === 'en' ? 'Bibliography' : 'Bibliografía',
    content: (
      <ReferenceList
        ids={[
          ...new Set(
            page.sections.flatMap((s) => [...s.refs, ...(paragraphSources[s.id] ?? []).flat()]),
          ),
        ]}
        heading={lang === 'en' ? 'Bibliography' : 'Bibliografía'}
      />
    ),
  });
  return (
    <div className="page-body prose nx-doc">
      <div className="page-head">
        <h1>{page.title[lang]}</h1>
        <p className="lede">{page.lede[lang]}</p>
      </div>
      <OverflowTabs key={page.title.en} ariaLabel={t.content} tabs={tabs} />
    </div>
  );
}
