// Planted-defect tests of the workspace-operation requirements (docs/design/features/workspace-operation/validation.md, ADR-0075).
// The Workspace view is rendered on the server with a recorded run in its session; the Recovery view acts on a click, so its
// refusals are checked on the source expressions that decide them, with each guard removed in turn.
import { afterEach, describe, expect, it } from 'vitest';
import { localSession } from '../lib/session';
import { read, renderIn } from './support';

// ---- WO-002: the verified effect against the preview
const SHA = (c: string) => c.repeat(64);
const run = (observed: string, expected: string) => ({
  run_id: 'r1',
  status: 'succeeded',
  events: [],
  workflow: {
    verified_success: true,
    goal_evidence: {
      write: {
        state: 'satisfied',
        history: [
          {
            kind: 'effect',
            receipt: {
              started_ms: 1,
              finished_ms: 5,
              intent: { action_id: 'a1', arguments: { path: 'x.txt' } },
              outcome: {
                status: 'succeeded',
                evidence: { path: 'x.txt', bytes: 3, sha256: observed, expected_sha256: expected },
              },
            },
          },
        ],
      },
    },
  },
});
const renderWorkspace = (recorded: unknown) =>
  renderIn('en', () => import('../components/Workspace'), {
    props: { token: 'token', onBack: () => undefined },
    prepare: async () => {
      const { localSession: session } = await import('../lib/session');
      session.workspace = { recipe: '{}', run: recorded };
    },
  });
/** What the evidence panel says about a recorded effect: a pass only for equal digests, a difference otherwise. */
const comparisonProblems = (html: string, differs: boolean) => {
  const out: string[] = [];
  const mismatch = html.includes('Digest mismatch');
  const match = html.includes('Exact byte digest match');
  if (differs && !mismatch) out.push('the difference is not shown');
  if (differs && match) out.push('a mismatch is shown as a pass');
  if (!differs && mismatch) out.push('a match is shown as a difference');
  if (!differs && !match) out.push('a match is not shown');
  return out;
};

// ---- WO-003: reconciliation refuses stale or unrelated evidence and requires review
const recoveryProblems = (source: string) => {
  const out: string[] = [];
  const reconcile = /async function reconcile\(\) \{[\s\S]*?\n  \}\n/.exec(source)?.[0] ?? '';
  const edit = /function edit\(index: number[\s\S]*?\n  \}\n/.exec(source)?.[0] ?? '';
  const button =
    /className="btn primary"\s*disabled=\{[\s\S]*?\}\s*onClick=\{\(\) => void reconcile\(\)\}/.exec(
      source,
    )?.[0] ?? '';
  for (const guard of [
    '!intent',
    '!validChecks',
    '!reviewed',
    '!quiescent',
    '!resolution',
    'note.trim().length < 10',
  ]) {
    if (!reconcile.includes(guard))
      out.push(`reconcile() does not require ${guard.replace('!', '')}`);
  }
  for (const guard of [
    '!validChecks',
    '!reviewed',
    '!quiescent',
    '!resolution',
    'note.trim().length < 10',
  ]) {
    if (!button.includes(guard)) out.push(`the button does not wait for ${guard.replace('!', '')}`);
  }
  if (!/setReviewed\(false\);\s*setQuiescent\(false\)/.test(edit))
    out.push('editing the evidence does not invalidate the review');
  if (
    !/catch \(e\) \{\s*setError\(String\(e\)\);\s*setReviewed\(false\);\s*setQuiescent\(false\)/.test(
      reconcile,
    )
  )
    out.push('a refused reconciliation keeps its review');
  if (!/intent_id: intent\.intent_id,\s*record_sha256: intent\.record_sha256/.test(reconcile))
    out.push('the request is not bound to the intent record');
  if (!/\/\^\[a-f0-9\]\{64\}\$\/i\.test\(c\.sha256\.trim\(\)\)/.test(source))
    out.push('a digest of another form is accepted');
  return out;
};

afterEach(() => {
  localSession.workspace = undefined;
});

describe('workspace-operation planted defects', () => {
  it('adversarial: an effect that differs from the preview is shown as a difference', async () => {
    // clean: equal digests are a match, and the rendered panel says so
    expect(comparisonProblems(await renderWorkspace(run(SHA('a'), SHA('a'))), false)).toEqual([]);
    // planted: the verified effect carries other bytes than the preview expected
    const different = await renderWorkspace(run(SHA('a'), SHA('b')));
    expect(different).toContain('Verified effects and native receipts');
    expect(comparisonProblems(different, true)).toEqual([]);
    // planted in the view itself: a panel that shows the pass for a difference, and one that drops the difference
    expect(
      comparisonProblems(different.replace('Digest mismatch', 'Exact byte digest match'), true),
    ).toEqual(['the difference is not shown', 'a mismatch is shown as a pass']);
    expect(
      comparisonProblems(
        different.replace('Digest mismatch', 'See the separately recorded goal predicate'),
        true,
      ),
    ).toEqual(['the difference is not shown']);
    expect(comparisonProblems(`${different}Exact byte digest match`, true)).toEqual([
      'a mismatch is shown as a pass',
    ]);
  });

  it('adversarial: stale or unrelated recovery evidence is refused', () => {
    const source = read('frontend/src/components/Recovery.tsx');
    expect(recoveryProblems(source)).toEqual([]);
    // each guard removed in turn: the stale review, the unrelated record, the unreviewed request
    expect(
      recoveryProblems(
        source.replace(
          '    setReviewed(false);\n    setQuiescent(false);\n  }\n  async function reconcile',
          '  }\n  async function reconcile',
        ),
      ),
    ).toEqual(['editing the evidence does not invalidate the review']);
    expect(recoveryProblems(source.replace('record_sha256: intent.record_sha256,', ''))).toEqual([
      'the request is not bound to the intent record',
    ]);
    expect(
      recoveryProblems(
        source.replace(
          '      !reviewed ||\n      !quiescent ||\n      note.trim().length < 10 ||',
          '      !quiescent ||\n      note.trim().length < 10 ||',
        ),
      ),
    ).toEqual(['reconcile() does not require reviewed']);
    expect(
      recoveryProblems(
        source.replace(
          '      setError(String(e));\n      setReviewed(false);\n      setQuiescent(false);',
          '      setError(String(e));',
        ),
      ),
    ).toEqual(['a refused reconciliation keeps its review']);
    expect(recoveryProblems(source.replace(/\/\^\[a-f0-9\]\{64\}\$\/i/, '/^.+$/'))).toEqual([
      'a digest of another form is accepted',
    ]);
  });
});
