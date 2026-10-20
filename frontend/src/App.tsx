// The six routes on the shared shell (ADR-0016, ADR-0057): the App at /app (a SurfacePage console, its view in ?mode=), the five
// documentation routes as pages. The product lands on the Introduction: the root and every unknown path render <Landing />, which
// opens /introduction and forwards an old App link such as /?mode=investigations&incident=C07 to /app with its query string and
// hash. The header order is the shell's STANDARD_ROUTES (App, Introduction, Methodology, Implementation, Experiments, Benchmark).
// The version is VERSION, injected at build (vite.config.ts); no version literal is written in code.
import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
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
import OperationsWorkbench from './pages/OperationsWorkbench';
import { useCopy } from './i18n';
import Science from './pages/Science';
import { introduction } from './data/introduction';
import { methodology } from './data/methodology';
import { implementation } from './data/implementation';
import { experiments } from './data/experiments';
import Benchmark from './pages/Benchmark';
declare const __APP_VERSION__: string;
const Introduction = () => <Science page={introduction} />;
const Methodology = () => <Science page={methodology} />;
const Implementation = () => <Science page={implementation} />;
const Experiments = () => <Science page={experiments} />;
const config: ShellConfig = {
  license: { en: 'Private source', es: 'Código privado' },
  visibility: 'private',
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
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return (
    <CitationsProvider items={CITATIONS}>
      <AppShell config={config}>
        <Suspense
          fallback={
            <div className="page-body nx-empty" role="status">
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
  return <RoutedApp />;
}
