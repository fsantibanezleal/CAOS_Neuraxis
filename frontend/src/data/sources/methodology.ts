/** Authored attribution by paragraph for the Methodology page's sections (the page unit writes this file only). Product
 * implementation is cited to released source, never randomly assigned to a paper merely because it shares the section. */
export const METHODOLOGY_SOURCES: Record<string, string[][]> = {
  exact: [
    ['reflexmesh2026'],
    ['behaviortree2026', 'reflexmesh2026'],
    ['sutton1999'],
    ['reflexmesh2026'],
  ],
  supervised: [
    ['reflexmesh2026'],
    ['chen2016', 'reflexmesh2026'],
    ['guo2017'],
    ['guo2017', 'reflexmesh2026'],
  ],
  sequential: [
    ['cho2014', 'ross2011'],
    ['li2010'],
    ['schulman2017', 'huang2020', 'maskableppo2026'],
    ['reflexmesh2026'],
  ],
  modelbased: [
    ['reflexmesh2026'],
    ['reflexmesh2026'],
    ['tseng2007', 'rao1999'],
    ['reflexmesh2026'],
  ],
  slow: [
    ['reflexmesh2026'],
    ['zhang2025', 'reflexmesh2026'],
    ['reflexmesh2026'],
    ['bago2017', 'melnikoff2018'],
  ],
  metacontrol: [
    ['madras2018', 'reflexmesh2026'],
    ['reflexmesh2026'],
    ['lee2014', 'murray2014', 'mcclelland1995'],
    ['agarwal2021', 'kool2016'],
  ],
};
