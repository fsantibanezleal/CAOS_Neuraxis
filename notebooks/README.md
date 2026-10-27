# Neuraxis research notebooks / Notebooks de investigación de Neuraxis

This is the product's didactic research layer. It teaches the released Reflexmesh methods on Neuraxis's committed, hash-audited episodes; it does not define a second copy of the algorithms. The notebook set covers fast event control, learned action policies, sequential control, deliberation allocation, full-matrix evaluation/transfer, and matched ablation/native-export parity, from fundamentals through sourced state-of-the-art comparisons.

Esta es la capa didáctica de investigación del producto. Enseña los métodos publicados de Reflexmesh con episodios comprometidos y auditados por hash de Neuraxis; no crea una segunda copia de los algoritmos. El conjunto cubre control rápido por eventos, políticas de acción aprendidas, control secuencial, asignación de deliberación, evaluación/transferencia de matriz completa y paridad de exportación nativa/ablaciones emparejadas, desde fundamentos hasta comparaciones con fuentes del estado del arte.

## Two language trees / Dos árboles de idioma

| Language / Idioma | Index / Índice | Folder / Carpeta |
|---|---|---|
| English | [en/README.md](en/README.md) | [en/](en/) |
| Español | [es/README.md](es/README.md) | [es/](es/) |

Every topic and notebook has the same relative path in both trees. Topic order and notebook levels are checked; the level 3 material cites the persisted Neuraxis research dossiers. The SDD claims no component beyond the state of the art, so there is no level 4 notebook or invented novelty claim.

Cada tema y notebook ocupa la misma ruta relativa en ambos árboles. Se verifican el orden de temas y los niveles; el material de nivel 3 cita los dossiers de investigación persistidos de Neuraxis. El SDD no afirma componentes más allá del estado del arte, por lo que no hay notebook de nivel 4 ni afirmación de novedad inventada.

## Environment and execution / Entorno y ejecución

The exact package pins are in [requirements.txt](requirements.txt). On Windows, run `scripts/setup.ps1 -Notebooks`; on Linux/macOS, run `scripts/setup.sh --notebooks`. Then use the fresh-kernel runner:

```sh
python scripts/run_notebooks.py
python scripts/run_notebooks.py --check --tmp <device-temp-root>
python scripts/check_notebooks.py
python scripts/check_notebooks.py --pypi
```

Only `run_notebooks.py` writes execution outputs. `--check` needs an explicitly named device temp root (or `CAOS_TEMP_ROOT`) and executes copied notebook inputs without writing into the checkout. `--pypi` is an optional online release check. No account credentials are used or needed.

Los únicos que escriben salidas de ejecución son `run_notebooks.py`. `--check` requiere una raíz temporal del dispositivo indicada explícitamente (o `CAOS_TEMP_ROOT`) y ejecuta copias de las entradas sin escribir en el checkout. `--pypi` es una verificación en línea opcional para la publicación. No se usan ni requieren credenciales de cuenta.

## Model assets / Activos de modelos

Methods that load fitted weights need the separately published Reflexmesh `v0.01.000` model bundle. Fetch the versioned assets and verify their release manifest from the notebook environment:

```sh
python -m reflexmesh.cli fetch-models --destination models/checkpoints --version v0.01.000
```

Set `NEURAXIS_CHECKPOINTS` to `models/checkpoints` before running the notebooks. The artifacts are published separately and are intentionally not copied into this repository. The M09/M10 notebooks use their hash-verified frozen traces by default; live planner calls happen only when `NEURAXIS_NOTEBOOK_MODEL` explicitly names an already configured local Ollama model. Each fresh notebook run uses Reflexmesh's isolated case workspace, and never writes experiment results into the source repository.

Los métodos que cargan pesos ajustados requieren el paquete de modelos Reflexmesh `v0.01.000`, publicado por separado. Descarga los activos versionados y verifica el manifiesto de publicación desde el entorno de notebooks:

```sh
python -m reflexmesh.cli fetch-models --destination models/checkpoints --version v0.01.000
```

Define `NEURAXIS_CHECKPOINTS` hacia `models/checkpoints` antes de ejecutar los notebooks. Los artefactos se publican por separado y no se copian a este repositorio. M09/M10 usan por defecto sus trazas congeladas verificadas por hash; las llamadas activas al planificador solo ocurren cuando `NEURAXIS_NOTEBOOK_MODEL` indica explícitamente un Ollama local ya configurado. Cada ejecución usa el espacio aislado de Reflexmesh y no escribe resultados experimentales en el repositorio fuente.
