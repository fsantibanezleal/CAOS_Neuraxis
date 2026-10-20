import type { Citation } from '@fasl-work/caos-app-shell';

/** The references only the Introduction page cites (write scope of its page unit). */
export const INTRODUCTION_CITATIONS: Citation[] = [
  {
    id: 'daw2011',
    label: 'Daw et al. 2011',
    citation:
      'Daw ND et al. Model-based influences on humans choices and striatal prediction errors. Neuron 69, 1204-1215 (2011).',
    doi: '10.1016/j.neuron.2011.02.027',
  },
  {
    id: 'mante2013',
    label: 'Mante et al. 2013',
    citation:
      'Mante V et al. Context-dependent computation by recurrent dynamics in prefrontal cortex. Nature 503, 78-84 (2013).',
    doi: '10.1038/nature12742',
  },
];
