# GitHub Pages

`.github/workflows/deploy-pages.yml` validates committed artifacts and builds the frontend on `main`. The base path is `/CAOS_Neuraxis/`. Route fallback assets must support direct bookmarked links in addition to in-app navigation. The deployed artifact comes from the same verified index as local execution inspection.

Pages has no process, filesystem or planner service. Browser execution uses its own bounded virtual workspace; canonical/imported replay executes no host effects. Users run the authenticated local service to execute native methods with their own machine and explicitly installed model.
