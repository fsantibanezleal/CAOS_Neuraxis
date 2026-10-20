- The documentation renderer is on the shell 0.15 areas (ADR-0017 section 2.1): every section of Methodology, Implementation and
  Experiments renders as the shell's `DocSection` with its `area` (a method also its `kind`), and the compound task study is a
  section of Experiments. The Bibliography tab and the per-section references row are gone: the references are the shell's one
  block at the end of the open topic. The symbols of a section render as the shell's `Glossary`.
- The Introduction is its own page (`pages/Introduction.tsx`) with two views, the executive view first and open on load (the
  shell's `ExecutiveView` fed by `content/executive.json`) and the technical view, whose five topics are the areas `problem`,
  `principles`, `math`, `pipeline` and `honesty`. The gate reports no ADR-0017.2, G10, G13, G16, G17 or G19 failure on it.
- The paragraph sources are split per page under `frontend/src/data/sources/` and `paragraph-sources.ts` composes them, so each
  page unit writes its own data, citations and sources files only.
- The measured-evidence finding of the metacontrol method is a note, so the section keeps exactly one honest callout (its limit).
- Tests: `areas.test.ts` (every section declares an area of its page, a method a kind, the Introduction floors in both
  languages), `sources.test.ts` (the split composes to exactly the previous map) and `pages/documentation.test.tsx` (the
  Introduction opens on the executive view, no Bibliography tab, nothing lost).
