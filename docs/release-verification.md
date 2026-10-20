# Release and reproduction verification

Public app: https://neuraxis.ml.fasl-work.com/

Reusable package: https://pypi.org/project/reflexmesh/0.1.1/

The package's [0.1.1 release](https://github.com/fsantibanezleal/reflexmesh/releases/tag/v0.01.001) adds audited benchmark adequacy and a separate semantic-transfer/routing study. The historical model checkpoints remain versioned with [0.1.0](https://github.com/fsantibanezleal/reflexmesh/releases/tag/v0.01.000). The app's /release.json records the deployed commit and file digests. /data/index.json contains all 14,400 canonical core references; /data/research.json reports the frozen structural transfer, ablations, routing and upstream subsets. /data/semantic-transfer/ contains the separate 1,536-trace study.

For a base installation:

```sh
python -m pip install reflexmesh==0.1.1
```

For the full local learned workbench, use this repository's setup script and requirements-api.txt. Actual tools remain local and require a session token and explicit workspace registration. No token is needed for public canonical replay, and the public /api path is disabled.

Run browser checks from frontend after building (the scripts are in frontend/scripts/). verify-browser.mjs, verify-content.mjs and verify-evidence.mjs accept NEURAXIS_QA_URL; set it to the intended live HTTPS origin and retain the returned report's target. Native checks use the disposable loopback scripts/qa-server.py and its generated qa/.native-token. Run verify-workspace.mjs before verify-recovery.mjs on a fresh disposable workspace. Set NEURAXIS_QA_MOBILE=1 for a narrow-screen actual recovery flow; verify-mobile.mjs also checks all control tabs, focus return and field access in both languages/themes. QA tokens and temporary user effects must stay outside version control.

For 0.02.006, hosted develop CI [36383755892](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383755892), main CI [36383873143](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383873143), and the audited static build [36383873065](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36383873065) succeeded. The deployed static and native commit is `8fd4c3f1a95632f56f9c0940f94541930a8513dd`; the [release receipt](validation/0.02.006/release.json) records HTTPS checks and the explicit limits of those checks. Historical billing failures do not describe this release.


Layout regression checks: `node scripts/verify-layout.mjs` performs actual route navigation,
wheel scrolling, Ctrl+End, touch swipes and final-source focus at six screen sizes,
in EN/ES and light/dark themes. `node scripts/verify-content.mjs` checks all scientific sections
at desktop and phone widths, including pointer hit testing on visible fragments of
wrapped source links. Reading-page height must grow with its content; document-height
equality is only appropriate for the desktop workbench. The public live checks use
`NEURAXIS_QA_URL=https://neuraxis.ml.fasl-work.com` and run against the promoted archive.
