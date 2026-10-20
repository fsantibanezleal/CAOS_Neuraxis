// The checks of BR-005, kept out of the test module so the gate tests and the planted-defect suite both import them.
/** The checks of BR-005, exported so the planted-defect suite runs the gate's own functions. */
export const templateRecordProblems = (text: string): string[] =>
  /^CAOS_PRODUCT_TEMPLATE (\d+\.\d{2}\.\d{3}) \(tag v\1\)$/.test(text.trim())
    ? []
    : ['.template-version is not in the template format'];
export const deployPlaceProblems = (target: string, deployFiles: string[]): string[] => {
  const out: string[] = [];
  if (target.trim() !== 'vps')
    out.push(`deploy/TARGET is "${target.trim().replace(/\n/g, ' / ')}", not the one place vps`);
  if (deployFiles.filter((f) => /^TARGET/i.test(f)).length !== 1)
    out.push('more than one deploy place file');
  return out;
};
