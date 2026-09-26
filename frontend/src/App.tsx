import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Network } from 'lucide-react';
import { AppShell, CitationsProvider, type ShellConfig } from '@fasl-work/caos-app-shell';
import { CITATIONS } from './data/citations';
import { architecture } from './architecture';
import OperationsWorkbench from './pages/OperationsWorkbench';
import { useCopy } from './i18n';
const Introduction = lazy(async () => {
  const [{ default: Science }, { introduction }] = await Promise.all([
    import('./pages/Science'),
    import('./data/introduction'),
  ]);
  return { default: () => <Science page={introduction} /> };
});
const Methodology = lazy(async () => {
  const [{ default: Science }, { methodology }] = await Promise.all([
    import('./pages/Science'),
    import('./data/methodology'),
  ]);
  return { default: () => <Science page={methodology} /> };
});
const Implementation = lazy(async () => {
  const [{ default: Science }, { implementation }] = await Promise.all([
    import('./pages/Science'),
    import('./data/implementation'),
  ]);
  return { default: () => <Science page={implementation} /> };
});
const Experiments = lazy(async () => {
  const [{ default: Science }, { experiments }] = await Promise.all([
    import('./pages/Science'),
    import('./data/experiments'),
  ]);
  return { default: () => <Science page={experiments} /> };
});
const Benchmark = lazy(() => import('./pages/Benchmark'));
const config: ShellConfig = {
  product: { name: 'Neuraxis', mark: <Network size={18} aria-hidden="true" /> },
  version: '0.02.003',
  routes: [
    { path: '/', en: 'App', es: 'App' },
    { path: '/introduction', en: 'Introduction', es: 'Introducción' },
    { path: '/methodology', en: 'Methodology', es: 'Metodología' },
    { path: '/implementation', en: 'Implementation', es: 'Implementación' },
    { path: '/experiments', en: 'Experiments', es: 'Experimentos' },
    { path: '/benchmark', en: 'Benchmark', es: 'Benchmark' },
  ],
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
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return (
    <CitationsProvider items={CITATIONS}>
      <AppShell config={{ ...config, fixed: false }}>
        <Suspense
          fallback={
            <div className="page-body nx-empty" role="status">
              {t.loading}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<OperationsWorkbench />} />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/implementation" element={<Implementation />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="*" element={<OperationsWorkbench />} />
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
