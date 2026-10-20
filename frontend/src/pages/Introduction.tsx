/**
 * Introduction (shell 0.15.0, ADR-0017 section 2.1, `conventions/problem-context-first.md`): a documentation page with two views.
 * The executive view is first and open on load; the shell's `ExecutiveView` renders it from `content/executive.json` and the
 * product never designs it (it holds nothing else: no section, paragraph, figure or equation sits beside it). The technical view
 * carries the five areas of the page (the problem, the principles, the mathematics, the pipeline, what is exact and what is
 * absent), one topic each, from `data/introduction.ts`. The references of each topic are the shell's one block at its end.
 */
import { DocPage, ExecutiveView, Tabs } from '@fasl-work/caos-app-shell';
import executive from '../../../content/executive.json';
import { introduction } from '../data/introduction';
import { useCopy } from '../i18n';
import { OverflowSubTabs } from '../components/OverflowTabs';
import { SectionContent } from './Science';

export default function Introduction() {
  return <IntroductionPage data={executive} base={import.meta.env.BASE_URL} />;
}

/** The page for a given data file (the contract test passes its own `base`, and may open the technical view). */
export function IntroductionPage({
  data,
  base,
  initial,
}: {
  data: unknown;
  base: string;
  initial?: 'executive' | 'technical';
}) {
  const { lang } = useCopy();
  const es = lang === 'es';
  return (
    <DocPage title={introduction.title} lede={introduction.lede[lang]}>
      <Tabs
        ariaLabel={es ? 'Vistas de la introducción' : 'Introduction views'}
        initial={initial}
        tabs={[
          {
            id: 'executive',
            label: es ? 'Ejecutiva' : 'Executive',
            content: <ExecutiveView data={data as never} base={base} />,
          },
          {
            id: 'technical',
            label: es ? 'Técnica' : 'Technical',
            content: (
              <OverflowSubTabs
                ariaLabel={es ? 'Temas de la vista técnica' : 'Topics of the technical view'}
                tabs={introduction.sections.map((s) => ({
                  id: s.id,
                  label: s.title[lang],
                  content: <SectionContent section={s} />,
                }))}
              />
            ),
          },
        ]}
      />
    </DocPage>
  );
}
