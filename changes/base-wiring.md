- Shell 0.15.0, pinned exactly (the `katex` override stays: the shell's peer range is `^0.16.0` and the product uses 0.19.0). The
  route table is the shell's `STANDARD_ROUTES`: the App is now at `/app` (still the `SurfacePage` console with its Tasks,
  Investigations and Engine views in `?mode=`), the root and every unknown path render the shell `Landing`, which opens the
  Introduction. An old App link such as `/?mode=investigations&incident=C07#x` is forwarded to `/app` with its query string and
  hash kept. The router moves to `main.tsx`; the version in the header is `VERSION`, injected at build.
- Template 0.08.002 recorded in `.template-version`; `product.json` (identity) and `deploy/TARGET` (`vps`) added.
- `CHANGELOG.md` headings follow the template format (`## [X.XX.XXX] - date`); no version literal remains in code (`tests/test_live_static.py`
  and the `neuraxis2026` citation read `VERSION`; the reflexmesh citation links the repository's releases page, not a tag literal).
- The template's general guards, taken verbatim and wired into CI: `check_version_coherence.py`, `check_deploy_place.py`,
  `check_doc_paths.py`, `check_content_standards.py`, `check_ci_budget.py`, `check_template_residue.py`, `check_web_baseline.py`,
  `check_svg_animation.py` (with `svg_animation.mjs`) and the base-integrity step. The dev requirements are pinned exactly
  (pytest 9.1.1, ruff 0.17.1, httpx 0.28.1). `STRUCTURE.md` (its content moved to `docs/README.md`) and `.vscode/settings.json` are
  removed as template residue.
- The browser gates and generators move from `frontend/` to `frontend/scripts/` with their callers; each gate that opened the App at
  the root now opens `/app`; `verify-routes.mjs` measures the landing and the forward of old links in a browser. `npm run gate` runs
  the shell gate (`gate.mjs`, `GATE_OUT` for the output folder; the App is a surface, so `-- --workbench ''`).
- Citations split by page into `frontend/src/data/citations/<page>.ts` (the references only one page cites); `citations.ts` keeps the
  shared ones and composes `CITATIONS`. A test holds ids unique, every referenced id defined and no reference left uncited.
- Test receipts in `docs/validation/0.02.001/*.xml`: a local machine path and the host names were redacted (`<host>`); nothing
  else in the receipts changed. One doc path (`docs/workbench/02_evidence-and-native.md`) now names the committed index.
- Four structural-hook classes without a rule (`nx-research-results`, `invest-layout`, `invest-files`, `gauge`) have an empty rule so
  the web baseline guard knows them; no style changed.
