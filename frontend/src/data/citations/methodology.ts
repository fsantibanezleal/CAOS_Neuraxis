import type { Citation } from '@fasl-work/caos-app-shell';

/** The references only the Methodology page cites (write scope of its page unit). */
export const METHODOLOGY_CITATIONS: Citation[] = [
  {
    id: 'zhang2025',
    label: 'Zhang et al. 2025',
    citation:
      'Zhang S et al. Leveraging Dual Process Theory in Language Agent Framework for Real-time Simultaneous Human-AI Collaboration (2025).',
    url: 'https://arxiv.org/abs/2502.11882',
  },
  {
    id: 'madras2018',
    label: 'Madras et al. 2018',
    citation:
      'Madras D, Pitassi T, Zemel R. Predict Responsibly: Improving Fairness and Accuracy by Learning to Defer. NeurIPS 2018.',
    url: 'https://arxiv.org/abs/1711.06664',
  },
  {
    id: 'rao1999',
    label: 'Rao and Ballard 1999',
    citation:
      'Rao RPN, Ballard DH. Predictive coding in the visual cortex: a functional interpretation of some extra-classical receptive-field effects. Nature Neuroscience 2, 79-87 (1999).',
    doi: '10.1038/4580',
  },
  {
    id: 'mattar2018',
    label: 'Mattar and Daw 2018',
    citation:
      'Mattar MG, Daw ND. Prioritized memory access explains planning and hippocampal replay. Nature Neuroscience 21, 1609-1617 (2018).',
    doi: '10.1038/s41593-018-0232-z',
  },
  {
    id: 'huang2020',
    label: 'Huang and Ontanon 2020',
    citation:
      'Huang S, Ontanon S. A closer look at invalid action masking in policy gradient algorithms (2020).',
    url: 'https://arxiv.org/abs/2006.14171',
  },
];
