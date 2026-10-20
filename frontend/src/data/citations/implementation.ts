import type { Citation } from '@fasl-work/caos-app-shell';

/** The references only the Implementation page cites (write scope of its page unit). */
export const IMPLEMENTATION_CITATIONS: Citation[] = [
  {
    id: 'onnx2026',
    label: 'ONNX Runtime documentation',
    citation: 'ONNX Runtime. Inference runtime and execution providers. Official documentation.',
    url: 'https://onnxruntime.ai/docs/',
  },
  {
    id: 'pyo32026',
    label: 'PyO3 documentation',
    citation:
      'PyO3. Python and Rust interoperability, parallelism and interpreter ownership. Official documentation.',
    url: 'https://pyo3.rs/main/parallelism',
  },
];
