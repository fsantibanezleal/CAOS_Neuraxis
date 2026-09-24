# evidence-workbench convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

Full 14,400-episode export passed. Twenty-one frontend tests and the production build passed September 23. Local and live canonical hydration verified all 240 method-family pairs; 72 viewport checks and 100 scientific content checks passed. The dedicated live content gate now accepts an explicit target URL and records it.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/check_artifacts.py | Implemented and locally verified; see evidence above. |
| R-002 | frontend/src/test/artifact-integrity.test.ts | Implemented and locally verified; see evidence above. |
| R-003 | frontend/verify-content.mjs | Passed: 100 scientific sections in both languages and themes. |
| R-004 | frontend/verify-evidence.mjs | Passed: 240 canonical pairs and four localized/themed findings views. |
| R-005 | frontend/verify-mobile.mjs | Passed: 12 phone size/theme/language combinations after fixing clipped controls. Actual recovery and readmission also passed at 360px width. |


## User review correction, September 23

The user rejected the fixed reading-page layout. Earlier viewport equality and DOM
content counts did not establish usable vertical access. They are superseded by:

| Requirement | Gate | Local verdict |
| --- | --- | --- |
| R-006 | frontend/verify-layout.mjs | 120 reading/result route combinations passed real wheel, keyboard, touch and navigation checks. |
| R-007 | frontend/verify-layout.mjs | Shared shell typography and block measures restored; custom 1100px section caps removed; rendered desktop and phone review completed. |
| R-008 | frontend/verify-content.mjs | 200 scientific section views passed final-reference focus, viewport and hit testing, across desktop/phone, EN/ES and both themes. |

The desktop workbench retains its sized panels. Compact screens, documentation and
benchmark pages use document flow. Desktop route/controls checks passed 72 combinations;
phone controls passed 12 combinations. All 240 canonical method-family pairs and
four findings views passed again. These are measured fixes, not user design acceptance.
