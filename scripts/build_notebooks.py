"""Build the committed bilingual analysis notebooks from canonical Neuraxis evidence."""

from __future__ import annotations

import contextlib
import io
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CORE_EN = """from pathlib import Path
import hashlib, json, os
ROOT = Path(os.environ['NEURAXIS_REPO_ROOT'])
data = ROOT / 'data' / 'derived'
raw_index = (data / 'index.json').read_bytes()
index = json.loads(raw_index)
audit = json.loads((data / 'benchmark-adequacy.json').read_text(encoding='utf-8'))
assert hashlib.sha256(raw_index).hexdigest() == audit['index_sha256']
rows = sorted(index['aggregate_results'], key=lambda row: row['method_id'])
assert len(rows) == 12 and len(index['cases']) == 20
assert len(index['episodes']) == 14400 and len(audit['perfect_methods']) == 7
print('Canonical index SHA-256:', hashlib.sha256(raw_index).hexdigest())
print('Core episodes:', len(index['episodes']), '| families:', len(index['cases']), '| methods:', len(rows))
print(f"{'Method':<9} {'Successes':>10} {'Episodes':>10} {'Rate':>8} {'Mean wall ms':>14}")
for row in rows:
    print(f"{row['method_id']:<9} {int(row['task_success'] * row['episodes']):>10} {row['episodes']:>10} {row['task_success']:>8.3f} {row['wall_ms']:>14.2f}")
print('Perfect methods:', ', '.join(audit['perfect_methods']))
print('Seed-variable cells:', audit['seed_variable_cells'], '/', audit['case_variant_method_cells'])
print('M12 failure cells:', json.dumps(audit['m12_failures'], sort_keys=True))"""

CORE_ES = """from pathlib import Path
import hashlib, json, os
ROOT = Path(os.environ['NEURAXIS_REPO_ROOT'])
data = ROOT / 'data' / 'derived'
raw_index = (data / 'index.json').read_bytes()
index = json.loads(raw_index)
audit = json.loads((data / 'benchmark-adequacy.json').read_text(encoding='utf-8'))
assert hashlib.sha256(raw_index).hexdigest() == audit['index_sha256']
rows = sorted(index['aggregate_results'], key=lambda row: row['method_id'])
assert len(rows) == 12 and len(index['cases']) == 20
assert len(index['episodes']) == 14400 and len(audit['perfect_methods']) == 7
print('SHA-256 del índice canónico:', hashlib.sha256(raw_index).hexdigest())
print('Episodios centrales:', len(index['episodes']), '| familias:', len(index['cases']), '| métodos:', len(rows))
print(f"{'Método':<9} {'Éxitos':>10} {'Episodios':>10} {'Tasa':>8} {'Tiempo medio ms':>16}")
for row in rows:
    print(f"{row['method_id']:<9} {int(row['task_success'] * row['episodes']):>10} {row['episodes']:>10} {row['task_success']:>8.3f} {row['wall_ms']:>16.2f}")
print('Métodos perfectos:', ', '.join(audit['perfect_methods']))
print('Celdas variables por semilla:', audit['seed_variable_cells'], '/', audit['case_variant_method_cells'])
print('Celdas fallidas de M12:', json.dumps(audit['m12_failures'], sort_keys=True))"""

TRANSFER_EN = """from pathlib import Path
import hashlib, json, os
ROOT = Path(os.environ['NEURAXIS_REPO_ROOT'])
data = ROOT / 'data' / 'derived'
core = json.loads((data / 'index.json').read_text(encoding='utf-8'))
transfer_path = data / 'semantic-transfer' / 'index.json'
transfer_bytes = transfer_path.read_bytes()
transfer = json.loads(transfer_bytes)
report = json.loads((data / 'semantic-transfer' / 'report.json').read_text(encoding='utf-8'))
route = json.loads((data / 'semantic-routing-study' / 'analysis.json').read_text(encoding='utf-8'))
assert hashlib.sha256(transfer_bytes).hexdigest() == report['index_sha256']
metrics = {row['method_id']: row for row in report['methods']}
core_metrics = {row['method_id']: row for row in core['aggregate_results']}
print('Core and semantic transfer are separate datasets; do not pool their denominators.')
print('Transfer episodes:', report['episodes_checked'], '| families:', len(transfer['cases']))
print(f"{'Method':<9} {'Transfer successes':>20} {'Episodes':>10} {'Rate':>8} {'Mean wall ms':>14}")
for method in ('M04', 'M09', 'M12'):
    row = metrics[method]
    print(f"{method:<9} {row['successes']:>20} {row['episodes']:>10} {row['successes']/row['episodes']:>8.3f} {row['mean_wall_ms']:>14.2f}")
print('M12 paired outcomes:', json.dumps(report['m12_paired'], sort_keys=True))
print('Routing gate threshold:', route['selected_threshold'], '| fit positives:', route['fit_positives'], '| calibration positives:', route['calibration_positives'])
for label, result in route['test'].items():
    print(f"routing {label}: episodes={result['episodes']} verified_successes={result['verified_successes']} planner_episodes={result['planner_episodes']} mean_wall_ms={result['mean_wall_ms']:.2f}")
print('Core M04 and M12 rates:', f"{core_metrics['M04']['task_success']:.3f}", f"{core_metrics['M12']['task_success']:.3f}")"""

TRANSFER_ES = """from pathlib import Path
import hashlib, json, os
ROOT = Path(os.environ['NEURAXIS_REPO_ROOT'])
data = ROOT / 'data' / 'derived'
core = json.loads((data / 'index.json').read_text(encoding='utf-8'))
transfer_path = data / 'semantic-transfer' / 'index.json'
transfer_bytes = transfer_path.read_bytes()
transfer = json.loads(transfer_bytes)
report = json.loads((data / 'semantic-transfer' / 'report.json').read_text(encoding='utf-8'))
route = json.loads((data / 'semantic-routing-study' / 'analysis.json').read_text(encoding='utf-8'))
assert hashlib.sha256(transfer_bytes).hexdigest() == report['index_sha256']
metrics = {row['method_id']: row for row in report['methods']}
core_metrics = {row['method_id']: row for row in core['aggregate_results']}
print('El núcleo y la transferencia semántica son conjuntos separados; no se deben combinar sus denominadores.')
print('Episodios de transferencia:', report['episodes_checked'], '| familias:', len(transfer['cases']))
print(f"{'Método':<9} {'Éxitos transferencia':>20} {'Episodios':>10} {'Tasa':>8} {'Tiempo medio ms':>16}")
for method in ('M04', 'M09', 'M12'):
    row = metrics[method]
    print(f"{method:<9} {row['successes']:>20} {row['episodes']:>10} {row['successes']/row['episodes']:>8.3f} {row['mean_wall_ms']:>16.2f}")
print('Resultados pareados de M12:', json.dumps(report['m12_paired'], sort_keys=True))
print('Umbral de la puerta:', route['selected_threshold'], '| positivos de ajuste:', route['fit_positives'], '| positivos de calibración:', route['calibration_positives'])
for label, result in route['test'].items():
    print(f"enrutamiento {label}: episodios={result['episodes']} éxitos_verificados={result['verified_successes']} episodios_planificador={result['planner_episodes']} tiempo_medio_ms={result['mean_wall_ms']:.2f}")
print('Tasas núcleo M04 y M12:', f"{core_metrics['M04']['task_success']:.3f}", f"{core_metrics['M12']['task_success']:.3f}")"""

PAGES = {
    "en/01-core-evidence.ipynb": (
        "Core benchmark evidence",
        "This notebook inspects the frozen 14,400-episode matrix and its separately generated adequacy audit. It recomputes displayed rates from the committed index and verifies that the audit names that exact index. A perfect method on these workloads is not evidence of general capability.",
        CORE_EN,
        "The fixed-rule ceiling, M12 cancellation failures and limited seed variation constrain what can be inferred. Do not claim learned superiority from this saturated matrix.",
    ),
    "es/01-evidencia-central.ipynb": (
        "Evidencia del benchmark central",
        "Este cuaderno inspecciona la matriz congelada de 14.400 episodios y su auditoría de adecuación, generada por separado. Recalcula las tasas desde el índice y verifica que la auditoría use ese mismo índice. Un método perfecto en estas cargas no demuestra capacidad general.",
        CORE_ES,
        "El techo de las reglas fijas, los fallos de cancelación de M12 y la escasa variación entre semillas limitan las inferencias. Esta matriz saturada no permite afirmar superioridad aprendida.",
    ),
    "en/02-transfer-and-routing.ipynb": (
        "Semantic transfer and routing evidence",
        "The transfer study changes task compositions and preserves its own lineage. The routing study reports a fitted allocation gate separately from the task outcomes. This notebook reads both source-bound reports and compares selected methods without pooling transfer with the core matrix.",
        TRANSFER_EN,
        "Held-out transfer and the small routing sample remain bounded evidence. A positive paired count is not a proof of broad transfer; the threshold, planner cost, invalid outputs and denominator must be read together.",
    ),
    "es/02-transferencia-y-enrutamiento.ipynb": (
        "Evidencia de transferencia semántica y enrutamiento",
        "El estudio de transferencia cambia las composiciones de tareas y conserva su propio linaje. El estudio de enrutamiento presenta la puerta de asignación ajustada por separado de los resultados de las tareas. Este cuaderno lee ambos informes ligados a sus fuentes y no combina la transferencia con la matriz central.",
        TRANSFER_ES,
        "La transferencia retenida y la pequeña muestra de enrutamiento son evidencia acotada. Un conteo pareado favorable no demuestra transferencia amplia; se deben leer juntos el umbral, el costo del planificador, las salidas inválidas y el denominador.",
    ),
}


def execute(source: str, root: Path) -> str:
    output = io.StringIO()
    old = os.environ.get("NEURAXIS_REPO_ROOT")
    os.environ["NEURAXIS_REPO_ROOT"] = str(root)
    try:
        with contextlib.redirect_stdout(output):
            exec(compile(source, "<notebook-cell>", "exec"), {"__name__": "__main__", "os": os})
    finally:
        if old is None:
            os.environ.pop("NEURAXIS_REPO_ROOT", None)
        else:
            os.environ["NEURAXIS_REPO_ROOT"] = old
    return output.getvalue()


def build_one(relative: str, definition: tuple[str, str, str, str]) -> None:
    title, introduction, code, interpretation = definition
    outputs = execute(code, ROOT)
    notebook = {
        "cells": [
            {"cell_type": "markdown", "metadata": {}, "source": [f"# {title}\n", "\n", introduction]},
            {"cell_type": "markdown", "metadata": {}, "source": ["## Recompute the source-bound summaries\n", "\n", "The following cell reads committed evidence only. It does not execute a policy or create new results."]},
            {"cell_type": "code", "execution_count": 1, "metadata": {}, "outputs": [{"name": "stdout", "output_type": "stream", "text": outputs.splitlines(keepends=True)}], "source": code.splitlines(keepends=True)},
            {"cell_type": "markdown", "metadata": {}, "source": ["## Interpretation limits\n", "\n", interpretation]},
        ],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.12"},
            "neuraxis": {"evidence_root": "data/derived", "read_only": True, "schema_version": 1},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    destination = ROOT / "notebooks" / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    for path, content in PAGES.items():
        build_one(path, content)
    print(f"built {len(PAGES)} bilingual notebooks from the canonical evidence")
