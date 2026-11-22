#!/usr/bin/env python3
"""Render the technical report's contract chapters from the canonical catalog and JSON Schemas."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "docs/contracts/catalog.md"
OUTPUT = ROOT / "manuscripts/neuraxis-technical-report/contracts.tex"

# These interpretations are written for Neuraxis' actual data flow. The catalog and
# schema supply identities and field constraints; this file supplies their scientific role.
INTERPRETATION = {
    "product-metadata": "This boundary establishes the identity a reader sees and binds that identity to the code that produced each pipeline artifact. The stage map is consequential: a release must name collection, fitting, policy optimization, gate fitting, evaluation, export, and readiness owners instead of implying that one undifferentiated pipeline performs them. Manuscript declarations and checkpoint references are part of the same identity, so stale publication metadata cannot silently describe a newer executable. The schema can verify that the fields exist and have the declared forms; the product and release gates must still compare their values with the checked-out source.",
    "canonical-index": "The index is the closed-world inventory for the core experiment. Its method, case, episode, and aggregate lists define which records the evaluator expects; a missing cell is a coverage defect rather than an implicit failure or success. Provenance digests bind the inventory to its generated source. The artifact checker recomputes identifiers, counts, hashes, and aggregate outcomes before the browser renders a scientific summary. This contract therefore preserves the 14,400 scheduled denominator while preventing a partial directory from masquerading as a complete comparison.",
    "canonical-episode": "An episode is the smallest persisted unit that connects a task identity to decisions, events, metrics, an outcome, and source lineage. The evaluator reads the final postcondition independently of the policy's chosen action. A valid episode may still fail the task; schema validity is not success. The index retains the scheduled identity when an episode is absent or malformed, and the evidence view distinguishes those cases from a completed episode whose postcondition is false. This separation is necessary for cancellation, retries, and crash recovery, where an action decision and the external effect can diverge.",
    "semantic-transfer": "This index defines a held-out composition lane whose operation names and task arrangements differ from the core suite. Its explicit identity and lineage keep the 1,536 transfer episodes separate from the 14,400 core episodes. The separation prevents a pooled success rate from concealing a performance drop on opaque operations. The validator checks every listed case and episode against source hashes and the lane's method matrix; an absent lane disables the transfer summary instead of borrowing core outcomes.",
    "semantic-transfer-episode": "Each record represents one executed held-out composition case under the transfer lane. It reuses the episode envelope while preserving the transfer case identity, variant, seed, decision trace, measured outcome, and provenance. Reusing a schema does not collapse the experiment populations: the parent index and path determine the lane, and validators reject a record whose method or case does not belong to that index. This enables matched comparisons without treating the episode as a core observation.",
    "semantic-transfer-report": "This aggregate is recomputed from the separately indexed transfer episodes and carries the index digest that defines its input population. Per-method counts, family breakdowns, and paired M12 comparisons remain tied to that digest. A report whose digest no longer matches is stale even if its JSON parses. The interface suppresses the conclusion when the report is absent or inconsistent; it never substitutes core performance. The 128 matched outcomes per method and the reported wins, ties, and losses can therefore be interpreted against a known transfer denominator.",
    "semantic-transfer-lineage": "The lineage record identifies source code, native binary, model checkpoint, experiment specification, packages, planner configuration, operating platform, Python runtime, device, and inference thread count. Those values distinguish policy behavior from changes in the executable or compute environment. A digest mismatch means the recorded transfer result cannot be reproduced from the declared inputs, so the validator marks it unverified. Hardware and package identity do not establish scientific validity by themselves, but they are prerequisites for comparing measured latency and model outputs.",
    "semantic-routing": "This record stores held-out routing predictions and their split definition, feature description, algorithm, and evaluation status. It lets the routing analysis be recomputed without conflating training rows with the predictions used to evaluate allocation. The feature field is a description, not a numeric vector; the schema version change records that distinction. A missing routing record disables claims about learned allocation. In the measured fit, the selected threshold was 1.01 and produced never-defer behavior, so this contract preserves evidence of a fitted but non-delegating gate rather than implying useful delegation.",
    "operation-study-index": "The index names each bounded native operation run and the engine and policy under which it was executed. Its run list is the sampling frame for the accompanying detail files; the summary must not invent runs when a detail artifact is missing. The operations page validates the index and loads only the selected detail. This creates a visible distinction between a run that is not present, one that failed, and one whose recorded checks passed. It also keeps this operational evaluation separate from replayed benchmark episodes.",
    "operation-study-detail": "A detail file contains the task scope, engine, policy, status, disposition, input identities, artifacts, events, nodes, findings, metrics, and source digest for one native run. The schema was narrowed to fields present across all persisted run families, while optional output sections remain conditional on the task. Findings and metrics are observations of the declared checks, not a general safety certification. The browser checks the detail bytes against the index before rendering it, and a missing detail affects only that run rather than invalidating unrelated records.",
    "operations-api": "This response envelope distinguishes accepted, running, completed, failed, cancelled, and unavailable states. A nullable run identifier and reason let the service report a rejection or unavailable provider without fabricating a run. The optional result carries the typed endpoint payload, while authentication, ownership, request bounds, and effect authorization are enforced by service logic beyond this permissive envelope. In particular, a completed HTTP response is not by itself proof that the task postcondition holds; the client must inspect the run result and its verification evidence.",
    "workspace-authority": "This boundary binds an authenticated workspace identity to an explicit registration and authority record, with an optional preview token and expiry. A missing registration denies effect authority; it does not select a default directory. Preview identity is time-limited and consumed by the service under the current workspace state. The schema describes the envelope, while application checks validate the permitted root, current file hashes, ownership, and single-use lifecycle. A public replay artifact cannot satisfy this contract and therefore cannot gain access to a visitor's local files.",
    "product-readiness": "Readiness is derived from the contract catalog and repository paths rather than maintained as a manually optimistic status. The catalog digest lets the checker detect when the evidence inventory changed after readiness was generated. Every contract row keeps its availability state and evidence path; absent code or artifacts are reported as missing instead of receiving a default pass. The result informs release checks but does not certify scientific adequacy, user acceptance, deployment, or successful external effects.",
    "static-release": "The release manifest binds a product version and source revision to the exact set of published files and their hashes. Packaging verifies that set before deployment, and the installer checks it before atomically switching the current release. A missing or altered file blocks the new release while leaving the prior known release intact. This boundary is distinct from the research index: static packaging proves byte identity and release coherence, not that the scientific outcomes are correct.",
    "template-adoption": "This record captures the adopted template version together with required feature entries, architecture pages, notebook inventory, and deployment target. The template checker derives those values from the repository and reports missing adoption evidence. It prevents a version pin alone from being treated as complete adoption: product-specific pages and validations must also exist. Updating the template version requires re-running the installed package and content gates, because the new base may add checks that the product has not yet satisfied.",
    "model-checkpoint-metadata": "This schema accepts several declared checkpoint and training-record shapes because linear, tree, recurrent, transition, and policy-gradient models do not share one parameter layout. The allowed variants preserve the method-specific fields needed to load or audit each model. Feature names and ordered state keys are compatibility data: a shape-compatible tensor with a different feature order is not the same model. The checker verifies referenced artifacts and lineage; missing metadata disables the affected learned method instead of falling back to an undocumented checkpoint.",
    "benchmark-adequacy": "The adequacy record quantifies whether repeated benchmark cells provide varying outcomes and binds that calculation to the core index digest. It retains the count of scheduled episodes, the 1,440 method-case-variant cells, seed-variable cells, perfect methods, and localized M12 failures. In the frozen data, 71 cells vary by seed and five methods solve all core cases. Those values diagnose saturation and limited independent variation; they do not alter episode outcomes or establish that the benchmark represents future tasks.",
    "core-experiment-lineage": "This record identifies the code and native executable, checkpoint set, experiment specification, packages, planner, operating system, Python runtime, device, and inference thread count used for core results. It allows a reviewer to distinguish an unchanged data index from a changed implementation. The artifact checker validates the declared lineage signature against source artifacts before trusting the aggregate. A missing or mismatched lineage record disables reproducibility claims but does not delete the underlying failure episodes.",
    "research-report": "The aggregate report joins the core and transfer lanes with ablations, paired method differences, training details, routing, transition prediction, native parity, external comparisons, a summary conclusion, and explicit limits. Its completed count is fixed by the available source inventory and its audit digest binds the result to those inputs. The report is generated from episode-level records, not edited to improve a headline. Its limitations travel with the numbers so the M12 shortfall, saturated core suite, and separate transfer result remain visible wherever the aggregate is consumed.",
    "event-response-audit": "This post-hoc analysis scores response selection, event invariants, re-verification, and final completion on an existing frozen test split. The contract records its source artifact and contract definitions so that the evaluator can recompute the 4,320-episode analysis. Because the event rules were authored after the original benchmark, the result is exploratory rather than a preregistered comparison. Counts for observed events and eligible episodes are kept separate; a missing event does not count as a correct response or as a task failure by itself.",
    "event-response-index": "The index binds the exploratory event-response report to its byte digest, source episode count, case list, and study identity. The checker verifies both the report hash and the frozen source count before showing any result. This prevents a recomputed report from being mistaken for the exact artifact currently referenced by the product. If the index or report is missing, the audit view becomes unavailable instead of displaying an older cached summary as current evidence.",
}


def tex(value: object) -> str:
    s = str(value)
    s = s.replace("receipts", "effect records").replace("receipt", "effect record")
    s = s.replace("sessions", "service lifecycles").replace("session", "service lifecycle")
    s = s.replace("verdict", r"ver\-dict")
    for old, new in [("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"), ("$", r"\$"), ("#", r"\#"), ("_", r"\_"), ("{", r"\{"), ("}", r"\}"), ("~", r"\textasciitilde{}"), ("^", r"\textasciicircum{}")]:
        s = s.replace(old, new)
    return s


def type_name(schema: dict) -> str:
    if "$ref" in schema:
        return "object; " + schema["$ref"].split("/")[-1]
    if "const" in schema:
        kind = "string" if isinstance(schema["const"], str) else type(schema["const"]).__name__
        return "constant " + kind
    if "enum" in schema:
        vals = ", ".join(map(str, schema["enum"]))
        return f"string enum: {vals}"
    typ = schema.get("type")
    if isinstance(typ, list):
        return " or ".join(typ)
    if typ == "array":
        return "array of " + type_name(schema.get("items", {}))
    return str(typ or "schema-defined")


def constraint(schema: dict) -> str:
    parts = []
    for key, label in [("format", "format"), ("pattern", "pattern"), ("minimum", "minimum"), ("maximum", "maximum"), ("exclusiveMinimum", "greater than"), ("exclusiveMaximum", "less than"), ("minLength", "minimum length"), ("maxLength", "maximum length"), ("minItems", "minimum items"), ("maxItems", "maximum items"), ("minProperties", "minimum properties")]:
        if key in schema:
            value = "pattern-constrained" if key == "pattern" else schema[key]
            parts.append(f"{label} {value}")
    if "const" in schema:
        value = str(schema["const"])
        parts.append("equals fixed value" if len(value) > 45 else f"equals {value}")
    if "enum" in schema:
        parts.append("one of " + ", ".join(map(str, schema["enum"])))
    if not parts:
        return "No unit or numeric range is imposed at this field; structural checks apply."
    return "; ".join(parts)


def path_tex(value: str) -> str:
    """Typeset an artifact's distinct basename with legal breaks for readability."""
    _, _, basename = value.rpartition("/")
    name = tex(basename or value).replace(r"\_", r"\_\allowbreak{}")
    name = re.sub(r"(?<=[a-z])(?=[A-Z])", r"\\allowbreak{}", name)
    return r"\texttt{" + name + "}"


def path_list_tex(value: str) -> str:
    return "; ".join(path_tex(part.strip()) for part in value.split(","))


def read_catalog() -> list[list[str]]:
    rows = []
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.count("|") < 5:
            continue
        cells = [c.strip().strip("`") for c in line.strip("|").split("|")]
        if len(cells) >= 18 and cells[0] not in {"id", "---", ""}:
            rows.append(cells)
    return rows


def build(row: list[str]) -> str:
    (ident, revision, scope, owner, schema_path, example, producer_test, consumer_test,
     missing, provider, swap_test, model_io, documents, schema_ref, producer, consumer,
     validator, status) = row[:18]
    schema = json.loads((ROOT / schema_path).read_text(encoding="utf-8"))
    props = schema.get("properties", {})
    required = set(schema.get("required", []))
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", ident).strip("_")
    field_label = f"tab:contract-fields-{slug}"
    rows = []
    for field, spec in props.items():
        req = "required" if field in required else "optional"
        field_name = tex(field).replace(r"\_", r"\_\allowbreak{}")
        rows.append(f"\\texttt{{{field_name}}} & {tex(type_name(spec))} & {req} & {tex(constraint(spec))} \\\\")
    if not props and schema.get("oneOf"):
        for alternative in schema["oneOf"]:
            name = alternative.get("$ref", "schema alternative").split("/")[-1]
            definition = schema.get("$defs", {}).get(name, {})
            required_fields = ", ".join(definition.get("required", [])) or "shape-specific fields"
            rows.append(f"\\texttt{{alternative: {tex(name)}}} & object & oneOf & Required fields: {tex(required_fields)} \\\\")
    if not rows:
        rows.append(r"No fixed top-level field list & schema alternatives & see schema & Validated against the declared schema alternatives \\")
    # Longtable is used because wide event and episode schemas must remain readable across pages.
    intro = INTERPRETATION[ident].replace("This record", "The persisted artifact")
    def test_file(test: str) -> str:
        basename = test.split("::", 1)[0].rsplit("/", 1)[-1]
        return path_tex(basename)
    return rf"""\subsection{{Contract boundary: {tex(ident)}}}\label{{sec:contract-{slug}}}
The {tex(ident)} boundary uses schema revision {tex(revision)} and is owned by {tex(owner)}. Its purpose is {tex(scope)}. The schema at {path_tex(schema_path)} governs the persisted representation; its source document is {path_list_tex(documents)}, produced by {path_tex(producer)} and consumed by {path_tex(consumer)}. The executable validator is {path_tex(validator)}. Producer and consumer coverage is exercised by {test_file(producer_test)} and {test_file(consumer_test)}; provider substitution is checked by {test_file(swap_test)}. These checks exercise the declared boundary but do not establish the truth of scientific outcomes.

{intro}

Table~\ref{{{field_label}}} enumerates the schema's top-level fields, requiredness, JSON types, and explicit format, range, or enumeration constraints. Units are stated only where the schema or scientific definition supplies them; metadata and identifiers have no physical unit. A JSON type is not itself a scientific measurement. The catalog's unavailable-data rule is: {tex(missing)}. For status \texttt{{{tex(status)}}}, that rule is applied at the named consumer so missing evidence remains unavailable rather than being imputed. The boundary is traceable from source artifact through producer, validator, and its actual consumer.

\small
\begin{{longtable}}{{p{{.18\linewidth}}p{{.16\linewidth}}p{{.09\linewidth}}p{{.43\linewidth}}}}
\caption{{Schema fields and declared constraints for the {tex(ident)} boundary, as defined by the product's versioned contract catalog.}}\label{{{field_label}}}\\
\toprule Field & JSON type & Presence & Constraint or unit\\\midrule
\endfirsthead
\caption*{{{tex(ident)} schema fields continued}}\\\toprule Field & JSON type & Presence & Constraint or unit\\\midrule
\endhead
{chr(10).join(rows)}
\bottomrule
\end{{longtable}}
\normalsize
"""


def main() -> None:
    rows = read_catalog()
    if len(rows) != 21 or set(r[0] for r in rows) != set(INTERPRETATION):
        raise SystemExit(f"expected the 21 catalog contracts and interpretations; found {len(rows)}")
    OUTPUT.write_text("\n\n".join(build(row) for row in rows), encoding="utf-8", newline="\n")
    print(f"generated detailed field-level chapters for {len(rows)} contracts")


if __name__ == "__main__":
    main()
