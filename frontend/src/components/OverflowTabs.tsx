import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SubTabs, Tabs, type SubTabDef, type TabDef } from '@fasl-work/caos-app-shell';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCopy } from '../i18n';

type ScrollState = { overflow: boolean; left: boolean; right: boolean };

function TabScroller({
  children,
  selector,
  className,
  level,
}: {
  children: ReactNode;
  selector: '.tablist' | '.subtablist';
  className: string;
  level: 'sections' | 'topics';
}) {
  const { lang } = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<ScrollState>({ overflow: false, left: false, right: false });

  useEffect(() => {
    const list = root.current?.querySelector<HTMLElement>(selector);
    if (!list) return;
    const update = () => {
      const overflow = list.scrollWidth > list.clientWidth + 2;
      const left = list.scrollLeft > 2;
      const right = list.scrollLeft + list.clientWidth < list.scrollWidth - 2;
      setScroll({ overflow, left, right });
    };
    const resize = new ResizeObserver(update);
    resize.observe(list);
    for (const tab of list.children) resize.observe(tab);
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    void document.fonts.ready.then(update);
    update();
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [selector, lang]);

  const move = (direction: -1 | 1) => {
    const list = root.current?.querySelector<HTMLElement>(selector);
    if (!list) return;
    list.scrollBy({ left: direction * Math.max(180, list.clientWidth * 0.7), behavior: 'smooth' });
  };

  const revealFocusedTab = (target: HTMLElement) => {
    if (target.getAttribute('role') !== 'tab') return;
    requestAnimationFrame(() => {
      const list = root.current?.querySelector<HTMLElement>(selector);
      if (!list || !target.isConnected || !list.contains(target)) return;
      const tab = target.getBoundingClientRect();
      const strip = list.getBoundingClientRect();
      const controls = root.current?.querySelector<HTMLElement>('.nx-tab-scroll-controls');
      const right = controls?.getBoundingClientRect().left ?? strip.right;
      if (tab.right > right - 6) {
        list.scrollTo({ left: list.scrollLeft + tab.right - right + 6, behavior: 'instant' });
      } else if (tab.left < strip.left + 6) {
        list.scrollTo({ left: list.scrollLeft + tab.left - strip.left - 6, behavior: 'instant' });
      }
    });
  };

  const labels =
    level === 'sections'
      ? {
          group: lang === 'en' ? 'Scroll sections' : 'Desplazar secciones',
          previous: lang === 'en' ? 'Previous sections' : 'Secciones anteriores',
          next: lang === 'en' ? 'More sections' : 'Más secciones',
        }
      : {
          group: lang === 'en' ? 'Scroll topics' : 'Desplazar temas',
          previous: lang === 'en' ? 'Previous topics' : 'Temas anteriores',
          next: lang === 'en' ? 'More topics' : 'Más temas',
        };

  return (
    <div
      className={`${className}${scroll.overflow ? ' has-overflow' : ''}`}
      ref={root}
      onFocusCapture={(event) => revealFocusedTab(event.target as HTMLElement)}
    >
      {scroll.overflow && (
        <div className="nx-tab-scroll-controls" role="group" aria-label={labels.group}>
          <button
            type="button"
            className="nx-tab-scroll-button"
            aria-label={labels.previous}
            title={labels.previous}
            disabled={!scroll.left}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="nx-tab-scroll-button"
            aria-label={labels.next}
            title={labels.next}
            disabled={!scroll.right}
            onClick={() => move(1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

export default function OverflowTabs({ tabs, ariaLabel }: { tabs: TabDef[]; ariaLabel: string }) {
  return (
    <TabScroller selector=".tablist" className="nx-overflow-tabs" level="sections">
      <Tabs ariaLabel={ariaLabel} tabs={tabs} />
    </TabScroller>
  );
}

export function OverflowSubTabs({ tabs, ariaLabel }: { tabs: SubTabDef[]; ariaLabel: string }) {
  return (
    <TabScroller selector=".subtablist" className="nx-overflow-subtabs" level="topics">
      <SubTabs
        ariaLabel={ariaLabel}
        orientation="vertical"
        tabs={tabs.map((tab) => ({
          ...tab,
          label: (
            <span title={typeof tab.label === 'string' ? tab.label : undefined}>{tab.label}</span>
          ),
        }))}
      />
    </TabScroller>
  );
}
