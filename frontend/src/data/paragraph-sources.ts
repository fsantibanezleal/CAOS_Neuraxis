import { BENCHMARK_SOURCES } from './sources/benchmark';
import { EXPERIMENTS_SOURCES } from './sources/experiments';
import { IMPLEMENTATION_SOURCES } from './sources/implementation';
import { INTRODUCTION_SOURCES } from './sources/introduction';
import { METHODOLOGY_SOURCES } from './sources/methodology';

/** Authored attribution by paragraph, composed from one file per documentation page (data/sources/<page>.ts, so the page units
 * write disjoint files, as for data/citations/). Product implementation is cited to released source, never randomly assigned to a
 * paper merely because it shares the section. Section ids are unique across the pages. */
export const paragraphSources: Record<string, string[][]> = {
  ...INTRODUCTION_SOURCES,
  ...METHODOLOGY_SOURCES,
  ...IMPLEMENTATION_SOURCES,
  ...EXPERIMENTS_SOURCES,
  ...BENCHMARK_SOURCES,
};
