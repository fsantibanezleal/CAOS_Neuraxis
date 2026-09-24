# Reliability audit, 2026-09-24

The full-system improvement request authorizes correction of existing behavior.
Reproductions against v0.02.000 found: an extra CSV field aborts the native task;
accepted child records may reference rejected parents; multiline CSV diagnostics
point to record offsets rather than source lines; JSON exponent overflow passes;
independent workflow files share a job namespace. Inspection also found lost run
navigation, unrecoverable expired credentials, incomplete results styled as passed,
and shared deployment dependencies that cannot roll back with application code.

Primary references: Python's [CSV contract](https://docs.python.org/3/library/csv.html)
documents extra-field storage and physical line counts;
the [JSON decoder contract](https://docs.python.org/3/library/json.html) provides
separate float and constant hooks. These support explicit row representations,
physical line tracking, and finite numeric admission. The implementation findings
above come from local executed cases, not from those references.

Rendered review additionally found repeated full-index downloads between method
tabs and source highlighting that scrolled again on unrelated renders. The index
now has session-scoped request sharing with explicit refresh/failure recovery;
source scrolling is tied to explicit selection and cleared on history restoration.
The browser regressions exercise the actual navigation and input identity, not
only screenshots or the presence of buttons.

Corrections preserve the existing native controller and all 19,488 frozen policy
episodes. CSV relationships resolve in the source directory first, otherwise only
to a unique table alias. Accepted rows must reference accepted rows; rejection
propagates to a fixed point. Missing or ambiguous tables are reported as unchecked,
not silently certified. Duplicate IDs retain the first structurally valid record;
later duplicates are quarantined, and this order-dependent policy is disclosed.
Independent workflows are analyzed independently. No uploaded source executes.

Run history remains session-owned. Expired authority cannot recover old uploads;
the UI preserves any downloaded result already in memory, explains expiration,
and permits a fresh session without resubmitting work automatically. Credentials
remain memory-only. Bounded requests and a session list make retained runs deletable.

Review: changes fit the existing task and API authority boundaries. Acceptance
requires adversarial file cases, concurrent ownership/deletion tests, actual browser
recovery and history flows, regenerated source-bound operation experiments, and
an isolated deployment environment. GitHub's latest failed check has zero executed
steps and still cites account billing; local validation cannot claim hosted CI green.
