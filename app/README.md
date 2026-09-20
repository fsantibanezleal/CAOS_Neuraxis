# Local application

`main.create_app` composes the released reflexmesh service with this repository's canonical artifact directory, checkpoint location and built frontend. It requires an explicit local token. Use `scripts/serve.py` to generate a session token and start the loopback server.

The API streams real workload events and decisions, exposes registered case/method capabilities, accepts bounded run requests and acknowledges cancellation. It serves the same built workbench so bearer requests remain same-origin. Static public deployments do not expose these executable routes.
