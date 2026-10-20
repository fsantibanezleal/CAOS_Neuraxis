// The focus after "Open workflow editor": the editor opens in a state change, so the focus moves to the mobile switch in an
// effect that runs when the workspace becomes active, never in a requestAnimationFrame callback (the web baseline allows
// requestAnimationFrame in usePausedViz only). The node test environment has no DOM, so the source is read here and the focus
// itself is measured in the browser by scripts/verify-workspace.mjs.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./Workbench.tsx', import.meta.url), 'utf8');

describe('the focus after the workflow editor opens', () => {
  it('uses no requestAnimationFrame', () => {
    expect(source).not.toMatch(/requestAnimationFrame/);
  });

  it('moves the focus to the mobile switch in an effect that depends on the workspace becoming active', () => {
    const effect = /useEffect\(\(\) => \{([^]*?)\}, \[workspaceActive\]\);/.exec(source);
    expect(effect, 'an effect keyed on workspaceActive').not.toBeNull();
    const body = effect![1];
    expect(body).toMatch(/if \(workspaceActive && !wasActive\.current\)/);
    expect(body).toMatch(/mobileSwitch\.current\?\.focus\(\)/);
    expect(body).toMatch(/wasActive\.current = workspaceActive/);
  });

  it('does not steal the focus when the page restores an open editor: the previous value starts at the restored one', () => {
    expect(source).toMatch(/const wasActive = useRef\(workspaceActive\)/);
  });
});
