import { DocPage, ExecutiveView, Tabs } from '@fasl-work/caos-app-shell';
import executive from '../../../content/executive.json';
import { introduction } from '../data/introduction';
import { useCopy } from '../i18n';
import Science from './Science';

/** The first documentation route answers what the product does before opening its technical account. */
export default function Introduction() {
  const { lang } = useCopy();
  return (
    <DocPage title={introduction.title} lede={introduction.lede[lang]}>
      <Tabs
        ariaLabel={lang === 'en' ? 'Introduction views' : 'Vistas de la introducción'}
        tabs={[
          {
            id: 'executive',
            label: lang === 'en' ? 'Executive view' : 'Vista ejecutiva',
            content: <ExecutiveView data={executive} base={import.meta.env.BASE_URL} />,
          },
          {
            id: 'technical',
            label: lang === 'en' ? 'Technical view' : 'Vista técnica',
            content: <Science page={introduction} embedded />,
          },
        ]}
      />
    </DocPage>
  );
}
