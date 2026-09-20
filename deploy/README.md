# Deployment boundaries

The public workbench is static: built frontend plus checked canonical data. It provides bounded browser execution, scientific inspection and replay. The authenticated native execution service runs locally with registered workloads and explicitly configured checkpoints/model. Do not expose the local bearer service as a public multi-tenant agent host.

GitHub Pages builds from `main`, verifies the complete artifact matrix, then builds the shared-shell SPA with the repository base path. A static nginx mirror can serve the same build at the dedicated host. No deployment runs training, changes benchmark results or needs model credentials.

Before release, verify in-app navigation and bookmarked routes, canonical hydration, actual method/case/variant coverage, both languages/themes and phone/desktop containment. HTTP 200 and a build alone do not establish a working deployment. TLS must be checked with the actual hostname/SNI.
