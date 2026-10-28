# Notebook curriculum validation

Candidate: Neuraxis 0.02.013. The static gate measures the committed lesson structure. Fresh-kernel execution and the required
human reading review are separate release gates; none is inferred from a successful build.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Mirror, metadata and package pins | Remove a counterpart or falsify its level or package | `scripts/check_notebooks.py` | Reports the language, path and violated contract |
| Declare and run Reflexmesh methods | Remove a method entrypoint or replace an execution call with a trace read | `scripts/check_notebooks.py`; `tests/test_check_notebooks.py` | Requires declared method calls in the levels that teach them |
| Unique question and computed answer | Duplicate a question or quote a number absent from outputs | `scripts/check_notebooks.py` | Question uniqueness and output-bound answer check |
| Lesson floors | Remove a figure, method step, explanatory prose or state-of-the-art comparison | `scripts/check_notebooks.py` | Per-file floor reports the failed measure and value |
| Source integrity and reproducibility | Change a trace byte, force a kernel error or leave stale outputs | `scripts/run_notebooks.py --check --tmp <device-data-temp-root>` | Fresh kernels read source artifacts without writing into the checkout |
| Editorial quality | Read each EN/ES lesson against the ten notebook-bar criteria | Coordination review record | A static pass is necessary but does not certify that the lesson teaches its method |

The exact static floors are versioned in `scripts/notebook_bar.json`. The release receipt records the static gate, fresh-kernel
run, and review record independently.
