import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Network } from 'lucide-react';
import { AppShell, CitationsProvider, type ShellConfig } from '@fasl-work/caos-app-shell';
import { CITATIONS } from './data/citations';
import { architecture } from './architecture';
import Workbench from './pages/Workbench';
import { useCopy } from './i18n';
const Introduction=lazy(async()=>{const[{default:Science},{introduction}]=await Promise.all([import('./pages/Science'),import('./data/introduction')]);return{default:()=> <Science page={introduction}/>};});
const Methodology=lazy(async()=>{const[{default:Science},{methodology}]=await Promise.all([import('./pages/Science'),import('./data/methodology')]);return{default:()=> <Science page={methodology}/>};});
const Implementation=lazy(async()=>{const[{default:Science},{implementation}]=await Promise.all([import('./pages/Science'),import('./data/implementation')]);return{default:()=> <Science page={implementation}/>};});
const Experiments=lazy(async()=>{const[{default:Science},{experiments}]=await Promise.all([import('./pages/Science'),import('./data/experiments')]);return{default:()=> <Science page={experiments}/>};});
const Benchmark=lazy(()=>import('./pages/Benchmark'));
const config:ShellConfig={product:{name:'Neuraxis',mark:<Network size={18} aria-hidden="true"/>},version:'0.01.000',fixed:true,routes:[{path:'/',en:'App',es:'App'},{path:'/introduction',en:'Introduction',es:'Introducción'},{path:'/methodology',en:'Methodology',es:'Metodología'},{path:'/implementation',en:'Implementation',es:'Implementación'},{path:'/experiments',en:'Experiments',es:'Experimentos'},{path:'/benchmark',en:'Benchmark',es:'Benchmark'}],links:{github:'https://github.com/fsantibanezleal/CAOS_Neuraxis'},architecture,footer:{license:{en:'Private source',es:'Código privado'},provenance:{en:'Engine: reflexmesh · owned software cases',es:'Motor: reflexmesh · casos propios'},disclaimer:{en:'Virtual browser / measured replay / authenticated local execution',es:'Navegador virtual / reproducción medida / ejecución local autenticada'}}};
export default function App(){const{t}=useCopy();return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/,'')||undefined}><CitationsProvider items={CITATIONS}><AppShell config={config}><Suspense fallback={<div className="page-body wide nx-empty" role="status">{t.loading}</div>}><Routes><Route path="/" element={<Workbench/>}/><Route path="/introduction" element={<Introduction/>}/><Route path="/methodology" element={<Methodology/>}/><Route path="/implementation" element={<Implementation/>}/><Route path="/experiments" element={<Experiments/>}/><Route path="/benchmark" element={<Benchmark/>}/><Route path="*" element={<Workbench/>}/></Routes></Suspense></AppShell></CitationsProvider></BrowserRouter>;}
