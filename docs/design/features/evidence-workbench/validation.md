# Evidence workbench validation

Candidate: 0.02.016. The evidence UI must distinguish canonical replay from a fresh native run and must never display an unverified trace as canonical.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Reject changed bytes or identity | Serve a correct-looking episode with a wrong digest, run id, case, method, variant or seed | `frontend/src/test/artifact-integrity.test.ts` | Vitest integrity suite |
| Keep scientific pages reachable in both languages | Visit every route, tab and section at phone and desktop widths | `frontend/verify-content.mjs`, `frontend/verify-browser.mjs` | 84 route, language, theme and viewport states pass on the 0.02.012 local build |
| Expose compound results before the selected detail finishes | Delay or reject detail fetch after loading the operation index | `frontend/verify-content.mjs`, `scripts/check_operations.py` | Static index powers grouped run counts, findings and measured time; detail fetch still checks its SHA-256 |

The visual browser suite covers 390 x 844, 1280 x 800 and 2560 x 1440, both themes and languages. Live native service interaction is recorded separately from this static replay validation.
