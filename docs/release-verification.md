# Release and reproduction verification

Public app: https://neuraxis.ml.fasl-work.com/

The application release line adopts `@fasl-work/caos-app-shell` 0.19.2 (exact npm pin) and `CAOS_PRODUCT_TEMPLATE` 0.11.002. Shell 0.19.2 corrects G5's sticky-header occlusion measurement for content inside static semantic headers (SHG-074). Template 0.11.002 makes content-standard diagnostics UTF-8 safe when stdout is captured through a Windows ANSI-code-page pipe; the product guard and its adversarial regression test implement that adoption. `.template-version` records the template baseline and `frontend/package-lock.json` locks the shell artifact. The [0.02.010 release receipt](validation/0.02.010/release.json) records the prior build and live evidence; the [0.02.011 release receipt](validation/0.02.011/release.json) records the repository-link change and its deployment evidence. The GitHub repository is public and the app identifies its Apache-2.0 license. The [0.02.012 release receipt](validation/0.02.012/release.json) records the deployment, CI, static checks, live operation tests, and route/content/scroll evidence for the tagged [0.02.012 release](https://github.com/fsantibanezleal/CAOS_Neuraxis/releases/tag/v0.02.012).

Reusable package: https://pypi.org/project/reflexmesh/0.1.2/

The package's [0.1.1 release](https://github.com/fsantibanezleal/reflexmesh/releases/tag/v0.01.001) adds audited benchmark adequacy and a separate semantic-transfer/routing study. The historical model checkpoints remain versioned with [0.1.0](https://github.com/fsantibanezleal/reflexmesh/releases/tag/v0.01.000). The app's /release.json records the deployed commit and file digests. /data/index.json contains all 14,400 canonical core references; /data/research.json reports the frozen structural transfer, ablations, routing and upstream subsets. /data/semantic-transfer/ contains the separate 1,536-trace study.

For a base installation:

```sh
python -m pip install reflexmesh==0.1.2
```

For the full local learned workbench, use this repository's setup script and requirements-api.txt. Actual tools remain local and require a session token and explicit workspace registration. No token is needed for public canonical replay, and the public /api path is disabled.

Run browser checks from frontend after building. `npm run gate` runs the installed shell gate against the built nginx-style SPA; it verifies the named Neuraxis app and writes captures outside the repo (override the location with `NEURAXIS_GATE_OUTPUT`). `verify-browser.mjs`, `verify-content.mjs` and `verify-evidence.mjs` accept `NEURAXIS_QA_URL`; set it to the intended live HTTPS origin and retain the returned report's target. Native checks use the disposable loopback qa-server.py and its generated qa/.native-token. Run verify-workspace.mjs before verify-recovery.mjs on a fresh disposable workspace. Set NEURAXIS_QA_MOBILE=1 for a narrow-screen actual recovery flow; verify-mobile.mjs also checks all control tabs, focus return and field access in both languages/themes. QA tokens and temporary user effects must stay outside version control.

For 0.02.006, hosted develop CI [36383755892](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383755892), main CI [36383873143](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383873143), and the audited static build [36383873065](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383873065) succeeded. The deployed static and native commit is `8fd4c3f1a95632f56f9c0940f94541930a8513dd`; the [release receipt](validation/0.02.006/release.json) records HTTPS checks and the explicit limits of those checks. Historical billing failures do not describe this release.


Layout regression checks: `node verify-layout.mjs` performs actual route navigation,
wheel scrolling, Ctrl+End, touch swipes and final-source focus at six screen sizes,
in EN/ES and light/dark themes. `node verify-content.mjs` checks all scientific sections
at desktop and phone widths, including pointer hit testing on visible fragments of
wrapped source links. Reading-page height must grow with its content; document-height
equality is only appropriate for the desktop workbench. The public live checks use
`NEURAXIS_QA_URL=https://neuraxis.ml.fasl-work.com` and run against the promoted archive.

## 0.02.013 candidate

Candidate release adopts CAOS App Shell 0.19.5 and CAOS Product Template 0.12.000. It rebuilds all 36 bilingual notebooks against the measured method, prose, figure and computed-answer bar; adds executable Reflexmesh entrypoint declarations and schema validation; and records exact Python and frontend dependencies in the SDD technology matrix. Deployment and user design acceptance remain separate evidence in the release receipt.


## 0.02.014 candidate

Adopts CAOS App Shell 0.19.6 and CAOS Product Template 0.13.001. Adds the mandatory three-tier method map, bilingual level-4 BS-1 lessons, manuscript declaration and CI validation, contract metadata version 1.1.0, and a compiled and published technical report, version DOI 10.5281/zenodo.23765414 and concept DOI 10.5281/zenodo.23765413. The complete source and notebook gates pass; static/native deployment and live verification remain separate release evidence.

## 0.02.015 deployed baseline

Corrected the task workbench readiness contract by declaring and displaying its registered fixture load until verified task inputs and graph nodes arrived.

## 0.02.016 deployed release

Corrects notebook curriculum quality and reproducibility: English and Spanish indexes now agree with the level-4 BS-1 lesson and its falsifiable proposal status; Spanish lesson code comments and user-visible output are localized; repeated generated scope prose is removed; and transfer notebook rebuilding preserves its complete hash-bound analysis without duplicate cells. All 38 notebooks were fresh-kernel executed and reviewed against the ten-point notebook bar. The [source-bound release receipt](validation/0.02.016/release.json) records the exact `v0.02.016` source `83b696400c12e286e0e7115e303e72637aadb813`, matching static/native deployments, CI, notebook review, and live verification. Static and native services both report version 0.02.016; the static manifest covers 16,067 files, 19 live hashes and five routes. Live browser checks passed 975 shared-shell states and 296 scientific content checks; two bounded native runs verified receipts, exports, isolation and cleanup. Scientific methods, data, and results are unchanged, so the technical report remains at 0.02.014.
## 0.02.018 deployed release

This release adopts CAOS App Shell 0.19.9 and CAOS Product Template 0.14.000. It completes the bilingual notebook rebuild and validates the app, action workbench, evidence catalog, and manuscripts. The [release receipt](validation/0.02.018/release.json) records the source commit, CI, artifact hashes, live checks, manuscript versions, and deployment evidence. The published [GitHub release](https://github.com/fsantibanezleal/CAOS_Neuraxis/releases/tag/v0.02.018) and deployed site are both tied to commit `4a3c79f7e16b82c9712fc0f2581a274bf8639aa3`.

All 38 bilingual notebooks executed in fresh kernels; Python tests passed (4 skipped), frontend tests passed (34), formatting, production build, and source/research gates passed. Hosted main CI and the audited static release build passed. Live verification passed 975 shell states (157 captures, zero failures or waivers), 296 scientific content checks, 84 route/theme/language/viewport combinations, and 240 canonical evidence-view states. The live release manifest reports 16,067 files; 19 file digests and five direct routes were verified. Two production workbench runs verified native receipts, exports, cross-session isolation, and cleanup. The public API remains disabled.

The measured findings are unchanged: M12 solved 1,160/1,200 core episodes; M01 solved 1,200/1,200; on the 24-episode transfer comparison M04 solved 24/24 and M12 solved 21/24; all four ablations matched M12's success count; and the fitted gate selected never-defer. The evidence does not support a learned-superiority claim.

At the 0.02.018 source release, the latest Zenodo records were the technical report, version 0.02.018 ([10.5281/zenodo.23821075](https://doi.org/10.5281/zenodo.23821075)), and the research manuscript, version 0.02 ([10.5281/zenodo.23821087](https://doi.org/10.5281/zenodo.23821087)).

## 0.02.019 deployed release

This release adopts CAOS Product Template 0.14.001 and corrects clipped labels in the architecture maps. Its browser gate now measures only rendered SVG text, avoiding false failures from hidden zero-sized diagrams. The [source-bound release receipt](validation/0.02.019/release.json) records the exact deployed source commit `c80071ff1dfa7e661ff0655aa1e1162a885f71ad`, CI, archive digests, live checks, and manuscript versions. The [GitHub release](https://github.com/fsantibanezleal/CAOS_Neuraxis/releases/tag/v0.02.019) and the static site and bounded operations service are tied to that commit.

Hosted [Neuraxis CI](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/41217901058) and the [audited static build](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/41217901057) passed. The deployed static manifest contains 16,067 files; 19 file hashes and five routes were verified. The live shell gate passed 975 states with 157 captures, zero failures, and zero waivers. Live checks also passed 296 scientific-content checks, 84 route/theme/language combinations, 240 canonical evidence states, and 40 architecture combinations. Two live operations runs verified nine native receipts each, exports, cross-session isolation, deletion, and the disabled public `/api` route.

The Zenodo technical report was subsequently updated to version 0.02.019 ([10.5281/zenodo.23843751](https://doi.org/10.5281/zenodo.23843751)) to add the operational workbench implementation and cite the current M12 paper. The M12 manuscript remains version 0.02 ([10.5281/zenodo.23821087](https://doi.org/10.5281/zenodo.23821087)). No research method, data source, benchmark outcome, or conclusion changed. The separate post-publication receipt records the live file checksum and independent record verification.\n