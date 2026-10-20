- The design area passes the product template's SDD guards: `docs/design/SDD.md` has the twelve sections plus the Executive brief in the template's order
  (research basis with 26 decisions and their sources, sizing and contracts from the 13-row catalog, the technology matrix of every pin, the measured
  resources, lanes, cases, oracles, deploy driver, risks and ADR fit). `scripts/check_sdd.py` and `scripts/check_tech_matrix.py` are the template's
  0.08.002 files, taken verbatim.
- Every feature folder has requirement rows (`| ID | Requirement | Gate |`, each gate a test or script that exists) and a `validation.md` with one
  adversarial row per requirement. The first-design identifiers R-001 to R-014 map to the feature rows in the SDD. The new folder `base-0-08` holds this
  release's own requirements (the routes, the executive view, the documentation areas, the contract catalog and readiness, the evidence import).
- `docs/design/README.md` describes the area and `docs/design/measured-resources.md` records the commands and outputs behind the Resources table.
- `docs/README.md` and `README.md` describe the landing, the App at `/app`, the executive view and the contract catalog.
