"""Disposable loopback service for frontend integration checks, never deployment."""
from pathlib import Path
import secrets
import uvicorn
from reflexmesh.server import create_app

root = Path(__file__).resolve().parent
qa = root / 'qa'
qa.mkdir(exist_ok=True)
token = secrets.token_urlsafe(32)
(qa / '.native-token').write_text(token, encoding='utf8')
app = create_app(checkpoints=root.parent.parent / 'reflexmesh' / 'artifacts' / 'models',
                 token=token, static=root / 'dist')
uvicorn.run(app, host='127.0.0.1', port=4177, log_level='warning')
