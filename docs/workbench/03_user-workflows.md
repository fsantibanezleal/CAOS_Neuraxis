# Verified user workflows / Flujos verificados del usuario

The App route includes a Workspace tab for user-authored recipes. This is a real native dependency controller over a directory explicitly configured by the local operator. It uses registered file tools and optional immutable process templates. It does not claim to apply the learned benchmark policies to arbitrary user workflows.

La ruta App incluye Archivos para recetas del usuario. Es un controlador nativo real de dependencias sobre un directorio configurado explícitamente por el operador. Utiliza herramientas de archivos y plantillas de procesos registradas. No afirma aplicar políticas aprendidas de evaluación a flujos arbitrarios.

The operator starts `reflexmesh serve` with `--checkpoints`, `--static` and `--workspace` pointing to their installed model directory, built frontend and existing workspace. The bearer token comes from the configured token environment variable. The optional `--process-config` is an operator-owned JSON list of fixed process names, absolute executable paths, argument vectors and timeouts. The browser cannot register executables or change the workspace root. Process containment controls lifecycle; it is not an operating-system privilege sandbox.

El operador inicia `reflexmesh serve` con `--checkpoints`, `--static` y `--workspace`, apuntando a modelos instalados, interfaz compilada y espacio existente. El token procede de la variable de entorno configurada. `--process-config` permite una lista local de nombres, ejecutables absolutos, vectores de argumentos y plazos. El navegador no registra ejecutables ni cambia la raíz. La contención controla el ciclo de vida, no constituye aislamiento de privilegios del sistema.

1. Enter the local session token in Evidence, then open Workspace. Confirm the displayed canonical root and registered tools.
2. Add a `file.write` step with a relative path and exact UTF-8 content. The helper computes SHA-256 before execution. For `file.read` or a registered process, supply the independently expected output digest and relative verification path.
3. Additional helper steps depend on the previous step. The JSON editor supports a directed acyclic dependency graph, unique step IDs and bounded timeouts. Import loads a recipe without executing it.
4. Preview the recipe. Inspect the admitted tools, exact arguments, verification targets and current file fingerprints. The preview expires after 120 seconds and can be used once.
5. Execute the reviewed recipe. If a precondition changed, obtain a fresh preview. The runtime rechecks authority and effects independently; the outcome panel shows goal predicates and actual receipts.
6. Cancellation stops future admissions and requests cancellation of active work. It does not roll back completed writes. Export preserves the journal and final verification evidence for review.

1. Ingresar el token en Evidencia y abrir Archivos. Confirmar raíz canónica y herramientas.
2. Agregar `file.write` con ruta relativa y contenido UTF-8 exacto. El constructor calcula SHA-256 antes de ejecutar. Para `file.read` o procesos, indicar huella esperada de forma independiente y ruta de verificación.
3. Cada paso del constructor depende del anterior. JSON admite un grafo acíclico, identificadores únicos y plazos acotados. Importar no ejecuta.
4. Previsualizar y revisar herramientas, argumentos, objetivos y huellas actuales. La autorización revisada vence a los 120 segundos y se utiliza una vez.
5. Ejecutar la receta revisada. Una precondición modificada exige otra previsualización. El motor comprueba autoridad y efectos; el panel muestra predicados y recibos reales.
6. Cancelar detiene admisiones y solicita detener trabajo activo, sin revertir escrituras concluidas. Exportar conserva diario y verificación final.

A verified hash establishes the declared byte-level postcondition. It does not establish that those bytes are semantically correct for a broader task. A goal whose predicate already holds can succeed without redispatching its tool. This idempotent behavior must be considered when authoring process workflows.

Una huella verificada establece la poscondición declarada sobre bytes; no demuestra corrección semántica para un objetivo más amplio. Un objetivo cuyo predicado ya se cumple puede concluir sin repetir la herramienta. Esta idempotencia debe considerarse al diseñar procesos.

Choose **Unknown-effect recovery** to inspect intents whose effects remain unresolved. The authenticated runtime exposes the original action, retained resources, prior process/effect evidence and a hash of the current intent record. A changed record invalidates a reconciliation request. Recovery is unavailable while the workspace worker is active.

Seleccionar **Recuperar efectos desconocidos** para inspeccionar intenciones sin resultado resuelto. El motor autenticado muestra acción, recursos retenidos, evidencia previa y huella del registro actual. Un registro modificado invalida la solicitud. No se concilia mientras el trabajador está activo.

Add independent checks for every leased file: an expected SHA-256 or explicitly verified absence. Select a resolution supported by those checks, describe the inspection, and attest that affected processes are quiescent and residual effects have been reviewed. The backend performs the file checks, verifies eligibility and record identity, and records the outcome before releasing resources. Editing a check clears the review acknowledgments. The UI never equates cancellation with rollback or allows an unchecked “mark success” operation.

Agregar comprobaciones independientes de cada archivo retenido: SHA-256 esperado o ausencia explícita. Elegir una resolución respaldada, describir la inspección y confirmar que los procesos están detenidos y se revisaron efectos residuales. El servidor comprueba archivos, elegibilidad e identidad y registra el resultado antes de liberar recursos. Editar una comprobación elimina las confirmaciones de revisión. Cancelar nunca equivale a revertir ni permite declarar éxito sin evidencia.

Process intents without trustworthy termination evidence or a matching registered executable remain ineligible for workbench recovery. Their retained resources stay blocked; inspect and reconcile them through the runtime SDK only after establishing the missing evidence. A successful reconciliation does not re-execute the old command. A new workflow requires its own preview and admission.

Los procesos sin evidencia fiable de terminación o ejecutable registrado coincidente no se recuperan desde la interfaz. Sus recursos siguen bloqueados; inspeccionar y conciliar mediante SDK solo después de establecer la evidencia faltante. Conciliar no repite el comando anterior. Un flujo nuevo requiere su propia previsualización y admisión.
