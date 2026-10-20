- The Implementation page covers the `reproducibility` area (ADR-0017 section 2.1, gate check ADR-0017.2) in English and Spanish:
  the seed groups as a table (train from 10000, validation from 20000, calibration from 30000, test 40000 to 40009, the semantic
  study 82000 to 82007), the pinned versions (reflexmesh 0.1.2, checkpoints from v0.01.000) and the committed lineage digests
  (source, native source, checkpoint, native binary and specification, the packages, the platform), what `scripts/check_artifacts.py`
  verifies, how one result is reproduced as six ordered steps, and one honest callout on what is not reproducible bit for bit
  (native timing, the probabilistic planner, GPU labels). The text is transcribed from `docs/guides.md`, `docs/cases.md`,
  `docs/architecture.md`, `docs/evaluation/`, `data/derived/lineage.json`, `scripts/check_artifacts.py` and `requirements*.txt`.
- Tests: `areas.test.ts` requires the area, two dense paragraphs per language, the limit, four steps and four table rows.
