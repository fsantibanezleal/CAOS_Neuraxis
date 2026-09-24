"""Disposable loopback service for frontend integration checks, never deployment."""
from pathlib import Path
import secrets
import tempfile
import sys
import importlib.util
import uvicorn
from reflexmesh.effectors import ProcessTemplate
from reflexmesh.processes import worker_python

root = Path(__file__).resolve().parent
# A test-only source API overlay keeps the installed evaluation wheel untouched.
# It changes two modules in this disposable process, never files in site-packages.
if '--source-api' in sys.argv:
    source = root.parent.parent / 'reflexmesh' / 'python' / 'reflexmesh'
    for name in ('server', 'workspace_service'):
        spec = importlib.util.spec_from_file_location('reflexmesh.' + name, source / (name + '.py'))
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
from reflexmesh.server import create_app
qa = root / 'qa'
qa.mkdir(exist_ok=True)
workspace = Path(tempfile.mkdtemp(prefix='workspace-', dir=qa))
(qa / '.workspace-path').write_text(str(workspace), encoding='utf8')
token = secrets.token_urlsafe(32)
(qa / '.native-token').write_text(token, encoding='utf8')
app = create_app(checkpoints=root.parent.parent / 'reflexmesh' / 'artifacts' / 'checkpoints',
                 token=token, static=root / 'dist', workspace=workspace,
                 process_templates=(ProcessTemplate('qa_delay', (worker_python(), '-c',
                    'import time,pathlib; time.sleep(5); pathlib.Path("qa-delayed.txt").write_text("done")'), 10),))
uvicorn.run(app, host='127.0.0.1', port=4177, log_level='warning')
