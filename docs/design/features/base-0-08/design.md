# base-0-08 design

The release 0.03.000 moves Neuraxis from the shell 0.9.3 with no template record onto the current base: the shell 0.15.0 pinned exactly (0.16.0 at the
Focus-mode unit), the product template 0.08.002 recorded in `.template-version`, the documentation framework at its floors, a contract catalog for
every committed document and the operations API, and the SDD gate. Sized before it was built (`plans/system-one/sizing.md`); this record and its
requirements were completed after the units that are in this tree, on 2026-10-20, from the code, the tests and the catalog.

## Routes and the landing

The route table is the shell's `STANDARD_ROUTES`: the App at `/app` (the `SurfacePage` console, its view held in `?mode=`: Tasks, Investigations and
the engine and local workspace), the Introduction, Methodology, Implementation, Experiments and Benchmark pages, and the shell `Landing` at `/` and
for every unknown path, which opens the Introduction on its executive view and forwards an old App link (for example
`/?mode=investigations&incident=C07#x`) to `/app` with its query string and hash. The router lives in `frontend/src/main.tsx` so the App can be tested
under a memory router. The header version is `VERSION`, injected at build by `frontend/vite.config.ts`. The browser gates and generators live in
`frontend/scripts/`, each gate that opened the App at the root opens `/app`, and `frontend/scripts/verify-routes.mjs` measures the landing and the
forward in a real browser (28 checks at the unit's measurement). `frontend/scripts/gate.mjs` serves `dist/` through a static host that follows the
nginx rules of `deploy/neuraxis.nginx.tls` (the shell's own server has no single-page fallback) and holds `--require-focus` before the
pass-through arguments.

## The executive view

`content/executive.json` frames, in English and Spanish, the industry problem the product answers, as the shell's schema 2.0.0 requires: a title, a key
statement, headline figures, the five sub-tabs and three illustrations, with a linked source for every figure. It is written from the problem-context
research before the view was built. The three illustrations are `frontend/public/executive/pain.svg` (animated, a nine-second loop with a
reduced-motion block), `situation.svg` and `proposal.svg` (stills); the pain and proposal scenes share one floor so that the difference is the
state. `frontend/src/content/executive.test.ts` and `illustrations.test.ts` hold the file and the drawings, and `scripts/check_sdd.py` holds the
file against the shell's installed schema and the Executive brief section against restating it.

## The documentation areas

Every section of the four data files declares the shell's `area` (and, in Methodology, a `kind`), and `Science.tsx` renders it as the shell's
`DocSection`, with one references block at the end of the open topic and no Bibliography tab. The Introduction is a page of its own with two views,
executive first and the technical view of five topics second. The Implementation page gained its reproducibility section (seed groups, versions and
lineage digests, what `scripts/check_artifacts.py` verifies, six ordered steps and one limit). The paragraph sources are split per page and composed
by `frontend/src/data/paragraph-sources.ts`, and the citations are split per page in `frontend/src/data/citations/`, with a test that holds the
composition to the map the single file held.

## The contract catalog and readiness

`docs/contracts/catalog.md` has thirteen rows. Each schema is the single source of its contract: the Python producers and consumers validate
against it in `tests/contracts/`, the TypeScript types are generated from it (`frontend/scripts/gen-contract-types.mjs`, checked by `npm run build`),
and a provider tree under `docs/contracts/fixtures/data/` is held to the same assertions as the committed tree. `data-pipeline/core/readiness.py`
computes `data/derived/readiness.json` from the catalog and the repository with the standard library only, in the six declared states, and the site
labels each view with the most severe state of its rows (`frontend/src/readiness/`). The semantic-transfer index, episodes and lineage have a producer
in the engine; the four evidence documents are imported by `python data-pipeline/run.py import-evidence` from the engine at its tag v0.01.002,
verified against `docs/contracts/evidence-provenance.json`, and every writer validates before it writes.

## Bilingual surfaces

The product is English first with a Spanish interface (ADR-0066). Every executive text carries both languages (`frontend/src/content/executive.test.ts`
holds it), the readiness reasons are held to the catalog table in both languages (`tests/contracts/test_readiness.py` parses the table), and
measured values are formatted in the selected language (`frontend/src/test/number-locale.test.ts`). The Spanish executive texts write the decimal
comma and a no-break space before a percent sign.

## What is not here

The Focus mode of the App on the stage views (shell 0.16.0), the Methodology page at its floors and the Experiments and Benchmark pages at their
floors are other units of the sizing and are not in this tree. Decision parity of the browser simulation with the committed episode is not a property of the product (sizing boundary B13, decided
2026-10-20): the simulation is its own lane, and requirement BR-036 holds that lane honesty.
