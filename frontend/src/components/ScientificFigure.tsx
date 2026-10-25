import { useId } from 'react';
import { useCopy } from '../i18n';
import type { ContentSection } from '../data/content.types';

function lines(text: string, width = 23) {
  const result: string[] = [];
  for (const word of text.split(' ')) {
    if (!result.length || result.at(-1)!.length + word.length + 1 > width) result.push(word);
    else result[result.length - 1] += ' ' + word;
  }
  return result;
}
/** Figure topology conveys the mechanism, rather than repeating an unqualified feedback loop. */
export default function ScientificFigure({ section }: { section: ContentSection }) {
  const { lang } = useCopy();
  const marker = useId().replaceAll(':', '');
  const parallel = section.id === 'biology';
  const grouped = section.id === 'splits';
  const feedback = ['exact', 'modelbased', 'runtime'].includes(section.id);
  const points = parallel
    ? [
        [35, 70],
        [320, 70],
        [605, 70],
        [180, 265],
        [745, 265],
      ]
    : grouped
      ? [
          [35, 155],
          [440, 15],
          [440, 155],
          [440, 275],
          [890, 155],
        ]
      : [
          [35, 70],
          [320, 70],
          [605, 70],
          [890, 70],
          [605, 285],
        ];
  const edges = parallel
    ? []
    : grouped
      ? [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 4],
          [2, 4],
          [3, 4],
        ]
      : [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ];
  const title =
    lang === 'en'
      ? parallel
        ? 'FIVE DISTINCT RESEARCH HYPOTHESES'
        : grouped
          ? 'DISJOINT EPISODE GROUPS'
          : 'COMPUTATION & EVIDENCE FLOW'
      : parallel
        ? 'CINCO HIPÓTESIS DE INVESTIGACIÓN DISTINTAS'
        : grouped
          ? 'GRUPOS DE EPISODIOS DISJUNTOS'
          : 'FLUJO DE CÓMPUTO Y EVIDENCIA';
  return (
    <>
      <figure className="science-figure science-figure-wide">
        <div className="science-figure-title">
          <span>{title}</span>
          <span>{section.id.toUpperCase()}</span>
        </div>
        <svg
          className="science-figure-desktop"
          viewBox="0 0 1150 455"
          role="img"
          aria-label={section.figure[lang]}
        >
          <defs>
            <marker id={marker} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-accent)" />
            </marker>
          </defs>
          {edges.map(([a, b], i) => {
            const [x, y] = points[a],
              [u, v] = points[b];
            return (
              <path
                key={i}
                d={
                  u > x
                    ? `M${x + 220},${y + 51} C${x + 250},${y + 51} ${u - 30},${v + 51} ${u},${v + 51}`
                    : `M${x + 110},${y + 102} C${x + 110},${y + 150} ${u + 110},${v - 45} ${u + 110},${v}`
                }
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                opacity=".65"
                markerEnd={`url(#${marker})`}
              />
            );
          })}
          {feedback && (
            <>
              <path
                d="M715,387 L715,422 L145,422 L145,172"
                fill="none"
                stroke="var(--color-fg-subtle)"
                strokeDasharray="6 5"
                strokeWidth="1.5"
                markerEnd={`url(#${marker})`}
              />
              <text x="410" y="444" textAnchor="middle" fill="var(--color-fg-subtle)" fontSize="15">
                {lang === 'en'
                  ? 'New observed evidence updates state'
                  : 'La evidencia observada actualiza el estado'}
              </text>
            </>
          )}
          {section.nodes.map((node, i) => {
            const [x, y] = points[i % points.length];
            const words = lines(node[lang]);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="220"
                  height="102"
                  rx="10"
                  fill={i === 2 ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
                  stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-border)'}
                />
                <text
                  x={x + 16}
                  y={y + 24}
                  fill="var(--color-accent)"
                  fontFamily="var(--font-mono)"
                  fontSize="13"
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text x={x + 16} y={y + 52} fill="var(--color-fg)" fontSize="16" fontWeight="500">
                  {words.map((line, j) => (
                    <tspan key={j} x={x + 16} dy={j ? 21 : 0}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          {section.id === 'splits' && (
            <g>
              <rect x="25" y="395" width="1100" height="43" rx="5" fill="var(--color-surface-2)" />
              <text x="575" y="422" textAnchor="middle" fill="var(--color-bad)" fontSize="16">
                {lang === 'en'
                  ? 'NO TEST LABELS OR EPISODE ROWS RETURN TO TRAINING'
                  : 'NINGUNA ETIQUETA O FILA DE PRUEBA REGRESA AL ENTRENAMIENTO'}
              </text>
            </g>
          )}
        </svg>
        <figcaption>{section.figure[lang]}</figcaption>
      </figure>
      <figure className="science-figure science-figure-narrow">
        <div className="science-figure-title">
          <span>{title}</span>
          <span>{section.id.toUpperCase()}</span>
        </div>
        <svg
          viewBox={`0 0 360 ${section.nodes.length * 60 + 8}`}
          role="img"
          aria-label={section.figure[lang]}
        >
          {section.nodes.map((node, i) => {
            const y = 4 + i * 60;
            const labelLines = lines(node[lang], 30);
            return (
              <g key={i}>
                <rect
                  x="4"
                  y={y}
                  width="352"
                  height="52"
                  rx="8"
                  fill={i === 2 ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
                  stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-border)'}
                />
                <text x="18" y={y + 31} fill="var(--color-accent)" fontSize="14" fontWeight="700">
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text
                  x="56"
                  y={y + (labelLines.length > 1 ? 22 : 31)}
                  fill="var(--color-fg)"
                  fontSize="14"
                >
                  {labelLines.slice(0, 2).map((line, lineIndex) => (
                    <tspan key={lineIndex} x="56" dy={lineIndex ? 17 : 0}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption>{section.figure[lang]}</figcaption>
      </figure>
    </>
  );
}
