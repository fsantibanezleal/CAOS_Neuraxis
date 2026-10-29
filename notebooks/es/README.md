# Notebooks, español

Este índice sigue la escalera de métodos de Neuraxis y la investigación persistida. Cada tema avanza desde fundamentos (nivel 1), al comportamiento del paquete sobre una traza real (nivel 2) y a una comparación con fuentes del trabajo previo y evidencia emparejada de Neuraxis (nivel 3). El espejo está en [`../en/README.md`](../en/README.md); la ejecución se explica en [`../README.md`](../README.md).

## Temas

| Tema | Requisitos previos | Nivel 3 |
|---|---|---|
| [01-fast-event-control](01-fast-event-control/) | ninguno; tema de entrada | [comparación del estado del arte](01-fast-event-control/03-state-of-the-art-comparison.ipynb) |
| [02-learned-action-policies](02-learned-action-policies/) | tema 01 | [comparación del estado del arte](02-learned-action-policies/03-state-of-the-art-comparison.ipynb) |
| [03-sequential-control](03-sequential-control/) | tema 02 | [comparación del estado del arte](03-sequential-control/03-state-of-the-art-comparison.ipynb) |
| [04-deliberation-allocation](04-deliberation-allocation/) | tema 03 | [comparación del estado del arte](04-deliberation-allocation/03-state-of-the-art-comparison.ipynb) · [evaluación de la propuesta BS-1](04-deliberation-allocation/04-beyond-the-state-of-the-art.ipynb) |
| [05-evaluation-and-transfer](05-evaluation-and-transfer/) | temas 01–04 | [comparación del estado del arte](05-evaluation-and-transfer/03-state-of-the-art-comparison.ipynb) |
| [06-ablation-and-export-parity](06-ablation-and-export-parity/) | tema 05 | [comparación del estado del arte](06-ablation-and-export-parity/03-state-of-the-art-comparison.ipynb) |

## Notebooks

| Notebook | Nivel | Qué enseña |
|---|---:|---|
| [01-fast-event-control/01-the-problem-and-the-data.ipynb](01-fast-event-control/01-the-problem-and-the-data.ipynb) | 1 | decisiones M01/M02 C01 verificadas por hash, candidatos filtrados por capacidades y resultados independientes |
| [01-fast-event-control/02-the-method-in-practice.ipynb](01-fast-event-control/02-the-method-in-practice.ipynb) | 2 | ejecuciones nuevas del paquete M01/M02 sobre C01 y comparación con sus corridas congeladas |
| [01-fast-event-control/03-state-of-the-art-comparison.ipynb](01-fast-event-control/03-state-of-the-art-comparison.ipynb) | 3 | Jev, arbitraje y antecedentes asíncronos rápido/lento frente a resultados emparejados de Neuraxis |
| [02-learned-action-policies/01-the-problem-and-the-data.ipynb](02-learned-action-policies/01-the-problem-and-the-data.ipynb) | 1 | decisiones M03/M04 C05 verificadas por hash, puntajes de candidatos y resultados independientes |
| [02-learned-action-policies/02-the-method-in-practice.ipynb](02-learned-action-policies/02-the-method-in-practice.ipynb) | 2 | ejecuciones nuevas de M03/M04 con checkpoints sobre condiciones emparejadas C05 |
| [02-learned-action-policies/03-state-of-the-art-comparison.ipynb](02-learned-action-policies/03-state-of-the-art-comparison.ipynb) | 3 | resultados emparejados de FSM, logística, XGBoost, GRU y bandido con límites publicados |
| [03-sequential-control/01-the-problem-and-the-data.ipynb](03-sequential-control/01-the-problem-and-the-data.ipynb) | 1 | trazas C07 M05–M08, estado recurrente, máscara de acciones y efectos |
| [03-sequential-control/02-the-method-in-practice.ipynb](03-sequential-control/02-the-method-in-practice.ipynb) | 2 | ejecuciones nuevas M05–M08 sobre C07 y verificación independiente de cancelación |
| [03-sequential-control/03-state-of-the-art-comparison.ipynb](03-sequential-control/03-state-of-the-art-comparison.ipynb) | 3 | resultados medidos, agrupaciones de fallos y límites del conjunto congelado |
| [04-deliberation-allocation/01-the-problem-and-the-data.ipynb](04-deliberation-allocation/01-the-problem-and-the-data.ipynb) | 1 | trazas C13 M09–M12, trabajo del planificador, latencia y evidencia de la puerta |
| [04-deliberation-allocation/02-the-method-in-practice.ipynb](04-deliberation-allocation/02-the-method-in-practice.ipynb) | 2 | ejecución nueva M11/M12; M09/M10 quedan congelados salvo que se configure un planificador local |
| [04-deliberation-allocation/03-state-of-the-art-comparison.ipynb](04-deliberation-allocation/03-state-of-the-art-comparison.ipynb) | 3 | antecedentes de valor de cómputo y aplazamiento frente al resultado negativo de la puerta |
| [04-deliberation-allocation/04-beyond-the-state-of-the-art.ipynb](04-deliberation-allocation/04-beyond-the-state-of-the-art.ipynb) | 4 | propuesta BS-1 falsable, resultados emparejados, ablaciones, latencia y evidencia que hoy impide afirmar superioridad |
| [05-evaluation-and-transfer/01-the-problem-and-the-data.ipynb](05-evaluation-and-transfer/01-the-problem-and-the-data.ipynb) | 1 | trazas C01 M01/M04/M09/M12 y procedencia del núcleo y de transferencia semántica |
| [05-evaluation-and-transfer/02-the-method-in-practice.ipynb](05-evaluation-and-transfer/02-the-method-in-practice.ipynb) | 2 | ejecuciones nuevas deterministas y aprendidas, más resultados de planificador congelados independientes |
| [05-evaluation-and-transfer/03-state-of-the-art-comparison.ipynb](05-evaluation-and-transfer/03-state-of-the-art-comparison.ipynb) | 3 | auditoría hash de 14.400 episodios, resultados emparejados, transferencia estructural y semántica por método |
| [06-ablation-and-export-parity/01-the-problem-and-the-data.ipynb](06-ablation-and-export-parity/01-the-problem-and-the-data.ipynb) | 1 | alcance de ablaciones emparejadas, vectores nativos y límites de la evidencia de paridad |
| [06-ablation-and-export-parity/02-the-method-in-practice.ipynb](06-ablation-and-export-parity/02-the-method-in-practice.ipynb) | 2 | ejecuciones nuevas M03/M04/M11/M12 y comparación con corridas C07 congeladas |
| [06-ablation-and-export-parity/03-state-of-the-art-comparison.ipynb](06-ablation-and-export-parity/03-state-of-the-art-comparison.ipynb) | 3 | cuatro ablaciones M12, incertidumbre agrupada, paridad nativa M03/M04 y alcance temporal |

## Más allá del estado del arte

El SDD define BS-1, el metacontrol M12 con versiones de recursos y resultados observados, como método propuesto para evaluar. La lección de nivel 4 examina sus mecanismos, resultados del benchmark, ejecuciones emparejadas, ablaciones y coste. La evidencia actual es negativa/parcial: M12 no supera la referencia protegida y no se establece superioridad por componente. «Más allá del estado del arte» es el nivel metodológico requerido para evaluar la propuesta, no una afirmación de que se haya demostrado un avance.
