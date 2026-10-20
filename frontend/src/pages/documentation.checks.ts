// The refutation of BR-007, kept out of the test module so the gate test and the planted-defect suite both import it.
/** The refutation of BR-007, exported so the planted-defect suite runs the gate's own function: what must not be in the page while the executive view is open. */
export const executiveOpenProblems = (page: string): string[] =>
  ['data-glossary', 'class="equation', 'data-doc-section', 'data-area'].filter((marker) =>
    page.includes(marker),
  );
