import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useLayoutEffect } from 'react';
import { Network } from 'lucide-react';
import {
  AppShell,
  CitationsProvider,
  Landing,
  STANDARD_ROUTES,
  type ShellConfig,
} from '@fasl-work/caos-app-shell';
import { CITATIONS } from './data/citations';
import { architecture } from './architecture';
import { useCopy } from './i18n';
import { methodology } from './data/methodology';
import { implementation } from './data/implementation';
import { experiments } from './data/experiments';
const OperationsWorkbench = lazy(() => import('./pages/OperationsWorkbench'));
const Science = lazy(() => import('./pages/Science'));
const Benchmark = lazy(() => import('./pages/Benchmark'));
const Introduction = lazy(() => import('./pages/Introduction'));
const Methodology = () => <Science page={methodology} />;
const Implementation = () => <Science page={implementation} />;
const Experiments = () => <Science page={experiments} />;
const config: ShellConfig = {
  license: { en: 'Private source', es: 'Código privado' },
  // Show the shared shell's repository icon/link. GitHub still enforces this
  // repository's private access; the footer continues to label the source private.
  visibility: 'public',
  contain: true,
  product: { name: 'Neuraxis', mark: <Network size={18} aria-hidden="true" /> },
  version: __APP_VERSION__,
  routes: STANDARD_ROUTES,
  links: { github: 'https://github.com/fsantibanezleal/CAOS_Neuraxis' },
  architecture,
  footer: {
    license: { en: 'Private source', es: 'Código privado' },
    provenance: {
      en: 'Engine: reflexmesh · verified file operations',
      es: 'Motor: reflexmesh · operaciones verificadas',
    },
    disclaimer: {
      en: 'File analysis and outputs · measured controller research · local workspace',
      es: 'Análisis y salidas · investigación medida · espacio local',
    },
  },
};
function RoutedApp() {
  const { t } = useCopy();
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector<HTMLElement>('.app-shell > main.page')?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);
  return (
    <CitationsProvider items={CITATIONS}>
      <AppShell config={config}>
        <Suspense
          fallback={
            <div className="page-body nx-empty" data-state="loading" role="status">
              {t.loading}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<OperationsWorkbench />} />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/implementation" element={<Implementation />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </AppShell>
    </CitationsProvider>
  );
}
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <RoutedApp />
    </BrowserRouter>
  );
}
