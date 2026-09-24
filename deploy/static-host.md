# Static host and route verification

`.github/workflows/build-release.yml` validates committed artifacts and builds the frontend on `main`. The selected private-repository deployment uses nginx at the root of `neuraxis.ml.fasl-work.com`. The frontend also supports an explicit `VITE_BASE` for a different hosting prefix, but no Pages deployment is configured. Direct bookmarked routes use nginx's `index.html` fallback; absent data and API paths return 404. The deployed artifact comes from the same verified index as local evidence inspection.

The static host has no process, filesystem or planner service. Browser execution uses its own bounded virtual workspace; canonical/imported replay executes no host effects. Users run the authenticated local service to execute native methods and verified workspace recipes on their own machine with explicitly installed models.
