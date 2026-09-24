import { useEffect, useRef, useState } from 'react';
import { Callout, Cite, Equation, Refs, SubTabs } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import type { ContentPage, ContentSection } from '../data/content.types';
export function ScientificDiagram({ section }: { section: ContentSection }) {
  const { lang } = useCopy();
  const leak = section.id === 'splits';
  return (
    <figure>
      <svg
        className="nx-schematic nx-schematic-desktop"
        viewBox={`0 0 1000 ${leak ? 260 : 210}`}
        role="img"
        aria-label={section.figure[lang]}
      >
        <defs>
          <marker
            id={`arr-${section.id}`}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6" fill="var(--color-accent)" />
          </marker>
        </defs>
        <text
          x="28"
          y="30"
          fill="var(--color-fg-subtle)"
          fontSize="13"
          fontFamily="var(--font-mono)"
        >
          {section.id.toUpperCase()} / NEURAXIS
        </text>
        {section.nodes.map((node, i) => (
          <g key={i}>
            {i > 0 && (
              <path
                d={`M${i * 194 - 4},100 L${i * 194 + 19},100`}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                markerEnd={`url(#arr-${section.id})`}
              />
            )}
            <rect
              x={20 + i * 194}
              y="64"
              width="168"
              height="74"
              rx="8"
              fill={i === 2 ? 'var(--color-accent-soft)' : 'var(--color-surface-2)'}
              stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-border)'}
            />
            <text x={104 + i * 194} y="94" textAnchor="middle" fill="var(--color-fg)" fontSize="12">
              {node[lang]}
            </text>
            <text
              x={104 + i * 194}
              y="119"
              textAnchor="middle"
              fill="var(--color-fg-subtle)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        ))}
        <path
          d="M880,140 L880,174 L104,174 L104,141"
          stroke="var(--color-fg-faint)"
          strokeDasharray="4 4"
          fill="none"
        />
        <text x="490" y="195" textAnchor="middle" fill="var(--color-fg-subtle)" fontSize="11">
          {lang === 'es'
            ? 'Evidencia registrada; cambios de política solo tras evaluación'
            : 'Recorded evidence; policy changes only after evaluation'}
        </text>
        {leak && (
          <g>
            <text x="500" y="230" textAnchor="middle" fill="var(--color-bad)" fontSize="13">
              {lang === 'es'
                ? 'PROHIBIDO: filas del mismo episodio en entrenamiento y prueba'
                : 'FORBIDDEN: rows of the same episode in training and test'}
            </text>
            <line x1="225" x2="775" y1="225" y2="225" stroke="var(--color-bad)" strokeWidth="2" />
          </g>
        )}
      </svg>
      <svg
        className="nx-schematic nx-schematic-mobile"
        viewBox={`0 0 360 ${section.nodes.length * 110 + 100}`}
        role="img"
        aria-label={section.figure[lang]}
      >
        {section.nodes.map((node, i) => (
          <g key={i}>
            {i > 0 && (
              <path
                d={`M180,${i * 110 - 4} v24 m-6,-6 l6,6 l6,-6`}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
              />
            )}
            <rect
              x="20"
              y={24 + i * 110}
              width="320"
              height="76"
              rx="8"
              fill={i === 2 ? 'var(--color-accent-soft)' : 'var(--color-surface-2)'}
              stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-border)'}
            />
            <text x="180" y={55 + i * 110} textAnchor="middle" fill="var(--color-fg)" fontSize="16">
              {node[lang]}
            </text>
            <text
              x="180"
              y={81 + i * 110}
              textAnchor="middle"
              fill="var(--color-fg-subtle)"
              fontSize="14"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        ))}
        <text
          x="180"
          y={section.nodes.length * 110 + 25}
          textAnchor="middle"
          fill="var(--color-fg-subtle)"
          fontSize="15"
        >
          <tspan x="180">{lang === 'es' ? 'Evidencia registrada' : 'Recorded evidence'}</tspan>
          <tspan x="180" dy="24">
            {lang === 'es'
              ? 'Evaluar antes de cambiar la política'
              : 'Evaluate before changing policy'}
          </tspan>
        </text>
      </svg>
      <figcaption className="nx-figure-caption">{section.figure[lang]}</figcaption>
    </figure>
  );
}
export function SectionContent({ section }: { section: ContentSection }) {
  const { lang, t } = useCopy();
  const article = useRef<HTMLElement>(null);
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
          {section.refs[i % section.refs.length] && (
            <Cite id={section.refs[i % section.refs.length]} />
          )}
        </p>
      ))}
      <ScientificDiagram section={section} />
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
      <Refs ids={section.refs} label={t.refs} />
    </article>
  );
}
function SectionPair({ sections }: { sections: ContentSection[] }) {
  const { lang, t } = useCopy();
  const [chosen, setChosen] = useState(sections[0].id);
  const section = sections.find((s) => s.id === chosen) ?? sections[0];
  return (
    <>
      <label className="nx-doc-nav-select">
        {t.content}
        <select value={chosen} onChange={(e) => setChosen(e.target.value)}>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title[lang]}
            </option>
          ))}
        </select>
      </label>
      <SectionContent section={section} />
    </>
  );
}
export default function Science({ page }: { page: ContentPage }) {
  const { lang, t } = useCopy();
  const paired = page.sections.length > 6;
  const tabs = paired
    ? [0, 2, 4, 6].map((start, i) => ({
        id: `group-${i}`,
        label: [
          ['Runtime and data', 'Motor y datos'],
          ['Policy engines', 'Motores de políticas'],
          ['Control and browser', 'Control y navegador'],
          ['Evidence and delivery', 'Evidencia y publicación'],
        ][i][lang === 'en' ? 0 : 1],
        content: <SectionPair sections={page.sections.slice(start, start + 2)} />,
      }))
    : page.sections.map((s) => ({
        id: s.id,
        label: s.title[lang],
        content: <SectionContent section={s} />,
      }));
  return (
    <div className="page-body wide prose nx-doc">
      <div className="page-head">
        <h1>{page.title[lang]}</h1>
        <p className="lede">{page.lede[lang]}</p>
      </div>
      <SubTabs key={page.title.en} orientation="vertical" ariaLabel={t.content} tabs={tabs} />
    </div>
  );
}
