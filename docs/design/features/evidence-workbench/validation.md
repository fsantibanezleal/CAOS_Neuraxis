# Evidence Workbench adversarial validation

Candidate: 0.02.016. The evidence UI must distinguish canonical replay from a fresh native run and must never display an unverified trace as canonical.

| requirement | adversarial check | gate |
|---|---|---|
| EW-001 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-002 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-003 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-004 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-005 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-006 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-007 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
| EW-008 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects changed content and an unparseable response before attempting JSON parsing` |
