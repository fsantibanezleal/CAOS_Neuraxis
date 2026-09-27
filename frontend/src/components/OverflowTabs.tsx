import { useEffect, useRef, useState } from 'react';
import { Tabs, type TabDef } from '@fasl-work/caos-app-shell';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCopy } from '../i18n';

type ScrollState = { overflow: boolean; left: boolean; right: boolean };

export default function OverflowTabs({ tabs, ariaLabel }: { tabs: TabDef[]; ariaLabel: string }) {
  const { lang } = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<ScrollState>({ overflow: false, left: false, right: false });

  useEffect(() => {
    const list = root.current?.querySelector<HTMLElement>('.tablist');
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
  }, [tabs, lang]);

  const move = (direction: -1 | 1) => {
    const list = root.current?.querySelector<HTMLElement>('.tablist');
    if (!list) return;
    list.scrollBy({ left: direction * Math.max(180, list.clientWidth * 0.7), behavior: 'smooth' });
  };

  const revealFocusedTab = (target: HTMLElement) => {
    if (target.getAttribute('role') !== 'tab') return;
    requestAnimationFrame(() => {
      const list = root.current?.querySelector<HTMLElement>('.tablist');
      if (!list || !target.isConnected) return;
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

  return (
    <div
      className={`nx-overflow-tabs${scroll.overflow ? ' has-overflow' : ''}`}
      ref={root}
      onFocusCapture={(event) => revealFocusedTab(event.target as HTMLElement)}
    >
      {scroll.overflow && (
        <div
          className="nx-tab-scroll-controls"
          role="group"
          aria-label={lang === 'en' ? 'Scroll sections' : 'Desplazar secciones'}
        >
          <button
            type="button"
            className="nx-tab-scroll-button"
            aria-label={lang === 'en' ? 'Previous sections' : 'Secciones anteriores'}
            title={lang === 'en' ? 'Previous sections' : 'Secciones anteriores'}
            disabled={!scroll.left}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="nx-tab-scroll-button"
            aria-label={lang === 'en' ? 'More sections' : 'Más secciones'}
            title={lang === 'en' ? 'More sections' : 'Más secciones'}
            disabled={!scroll.right}
            onClick={() => move(1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
      <Tabs ariaLabel={ariaLabel} tabs={tabs} />
    </div>
  );
}
