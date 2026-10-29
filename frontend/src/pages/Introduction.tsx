import { lazy, Suspense } from 'react';
import { Callout, DocPage, ExecutiveView, Tabs } from '@fasl-work/caos-app-shell';
import executive from '../../../content/executive.json';
import { introduction } from '../data/introduction';
import { useCopy } from '../i18n';

const Science = lazy(() => import('./Science'));

/** The first documentation route answers what the product does before opening its technical account. */
export default function Introduction() {
  const { lang } = useCopy();
  return (
    <DocPage title={introduction.title} lede={introduction.lede[lang]}>
      <Tabs
        ariaLabel={lang === 'en' ? 'Introduction views' : 'Vistas de la introducción'}
        initial="executive"
        tabs={[
          {
            id: 'executive',
            label: lang === 'en' ? 'Executive view' : 'Vista ejecutiva',
            content: <ExecutiveView data={executive} base={import.meta.env.BASE_URL} />,
          },
          {
            id: 'technical',
            label: lang === 'en' ? 'Technical view' : 'Vista técnica',
            content: (
              <>
                <Callout
                  variant="note"
                  title={lang === 'en' ? 'Research publications' : 'Publicaciones de investigación'}
                >
                  <p>
                    {lang === 'en' ? 'Publications: ' : 'Publicaciones: '}
                    <a href="https://doi.org/10.5281/zenodo.23765413">
                      {lang === 'en' ? 'product technical report' : 'informe técnico del producto'}
                    </a>
                    {' · '}
                    <a href="https://doi.org/10.5281/zenodo.23784117">
                      {lang === 'en' ? 'BS-1 method preprint' : 'preprint del método BS-1'}
                    </a>
                  </p>
                </Callout>
                <Suspense
                  fallback={
                    <div className="nx-empty" data-state="loading" role="status">
                      {lang === 'en'
                        ? 'Loading the technical account…'
                        : 'Cargando el análisis técnico…'}
                    </div>
                  }
                >
                  <Science page={introduction} embedded />
                </Suspense>
              </>
            ),
          },
        ]}
      />
    </DocPage>
  );
}
