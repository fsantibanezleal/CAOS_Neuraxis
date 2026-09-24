"""Check published research summaries against the immutable canonical index."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'data' / 'derived'


def validate(root=ROOT):
    report = json.loads((root / 'research.json').read_text(encoding='utf8'))
    index = json.loads((root / 'index.json').read_text(encoding='utf8'))
    if report['core']['index_sha256'] != hashlib.sha256((root / 'index.json').read_bytes()).hexdigest():
        raise ValueError('Research summary belongs to a different canonical index')
    if report['completed_episodes'] != 19488 or report['core']['episodes'] != 14400 or report['transfer']['episodes'] != 288:
        raise ValueError('Research coverage mismatch')
    actual = {row['method_id']: row for row in index['aggregate_results']}
    for row in report['core']['methods']:
        aggregate = actual.pop(row['method_id'])
        if row['episodes'] != aggregate['episodes'] or abs(row['success_rate'] - aggregate['task_success']) > 1e-12:
            raise ValueError('Research result differs from measured canonical result')
    if actual or len(report['core']['methods']) != 12 or len(report['ablations']) != 4:
        raise ValueError('Missing method or ablation')
    for value in report['ablations'].values():
        if value['episodes'] != 1200:
            raise ValueError('Incomplete ablation')
    return {'episodes': 19488, 'methods': 12, 'ablations': 4}


if __name__ == '__main__':
    print(json.dumps(validate()))
