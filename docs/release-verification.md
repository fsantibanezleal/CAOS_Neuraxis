# Release and reproduction verification

Public app: https://neuraxis.ml.fasl-work.com/

Reusable package: https://pypi.org/project/reflexmesh/0.1.0/

The package's [versioned release](https://github.com/fsantibanezleal/reflexmesh/releases/tag/v0.01.000) contains hash-verified models, all 19,488 owned experiment traces and fitting data, and the exact frozen evaluation installation. The app's /release.json records the deployed commit and file digests. /data/index.json contains all 14,400 canonical core references; /data/research.json reports structural transfer, ablations, routing and upstream subsets.

For a base installation:

```sh
python -m pip install reflexmesh==0.1.0
```

For the full local learned workbench, use this repository's setup script and requirements-api.txt. Actual tools remain local and require a session token and explicit workspace registration. No token is needed for public canonical replay, and the public /api path is disabled.

Run browser checks from frontend after building. verify-browser.mjs, verify-content.mjs and verify-evidence.mjs accept NEURAXIS_QA_URL; set it to the intended live HTTPS origin and retain the returned report's target. Native checks use the disposable loopback qa-server.py and its generated qa/.native-token. Run verify-workspace.mjs before verify-recovery.mjs on a fresh disposable workspace. Set NEURAXIS_QA_MOBILE=1 for a narrow-screen actual recovery flow; verify-mobile.mjs also checks all control tabs, focus return and field access in both languages/themes. QA tokens and temporary user effects must stay outside version control.

GitHub's private Actions jobs currently fail before execution because the account has reached its billing/spending limit. All release gates described here were executed locally; the public package's CI and Trusted Publishing workflow succeeded. Restoring private hosted Actions requires an account-level billing change, not additional code or user credentials in this project.


Layout regression checks: `node verify-layout.mjs` performs actual route navigation,
wheel scrolling, Ctrl+End, touch swipes and final-source focus at six screen sizes,
in EN/ES and light/dark themes. `node verify-content.mjs` checks all scientific sections
at desktop and phone widths, including pointer hit testing on visible fragments of
wrapped source links. Reading-page height must grow with its content; document-height
equality is only appropriate for the desktop workbench. The public live checks use
`NEURAXIS_QA_URL=https://neuraxis.ml.fasl-work.com` and run against the promoted archive.
