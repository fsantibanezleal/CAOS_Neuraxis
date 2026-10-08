import { SurfacePage } from '@fasl-work/caos-app-shell';
import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Activity, FlaskConical, SlidersHorizontal } from 'lucide-react';
import { useCopy } from '../i18n';
import Operations from '../components/Operations';
import Investigations from '../components/Investigations';
import { localSession } from '../lib/session';
const workbenchModule = import('./Workbench');
const Workbench = lazy(() => workbenchModule);

function Mode({ id, children }: { id: string; children: ReactNode }) {
  useEffect(() => {
    localSession.mode = id;
  }, [id]);
  return children;
}

export default function OperationsWorkbench() {
  const { lang } = useCopy();
  return (
    <SurfacePage
      deepLinkView="mode"
      ariaLabel={lang === 'en' ? 'Workspace modes' : 'Modos de trabajo'}
      tabs={[
        {
          id: 'tasks',
          label: (
            <>
              <Activity size={15} />
              {lang === 'en' ? 'Tasks' : 'Tareas'}
            </>
          ),
          content: (
            <Mode id="tasks">
              <Operations />
            </Mode>
          ),
        },
        {
          id: 'investigations',
          label: (
            <>
              <FlaskConical size={15} />
              {lang === 'en' ? 'Investigations' : 'Investigaciones'}
            </>
          ),
          content: (
            <Mode id="investigations">
              <Investigations />
            </Mode>
          ),
        },
        {
          id: 'advanced',
          label: (
            <>
              <SlidersHorizontal size={15} />
              {lang === 'en' ? 'Engine & local workspace' : 'Motor y espacio local'}
            </>
          ),
          content: (
            <Mode id="advanced">
              <Suspense
                fallback={
                  <p role="status" data-state="loading">
                    {lang === 'en' ? 'Loading engine controls…' : 'Cargando controles del motor…'}
                  </p>
                }
              >
                <Workbench />
              </Suspense>
            </Mode>
          ),
        },
      ]}
    />
  );
}
