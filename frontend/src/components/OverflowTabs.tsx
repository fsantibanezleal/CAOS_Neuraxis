import { SubTabs, Tabs, type SubTabDef, type TabDef } from '@fasl-work/caos-app-shell';
/** Overflow, keyboard navigation and touch targets belong to the shared shell. */
export default function OverflowTabs({ tabs, ariaLabel }: { tabs: TabDef[]; ariaLabel: string }) {
  return <Tabs ariaLabel={ariaLabel} tabs={tabs} />;
}
export function OverflowSubTabs({ tabs, ariaLabel }: { tabs: SubTabDef[]; ariaLabel: string }) {
  return <SubTabs ariaLabel={ariaLabel} orientation="vertical" tabs={tabs} />;
}
