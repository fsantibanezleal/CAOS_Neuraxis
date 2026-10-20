// The id checks of BR-014, kept out of the test module so the gate tests and the planted-defect suite both import them.
/** The three id checks of BR-014, exported so the planted-defect suite runs the gate's own functions. */
export const duplicateIds = (list: string[]): string[] =>
  list.filter((id, i) => list.indexOf(id) !== i);
export const undefinedIds = (list: string[], named: Set<string>): string[] => {
  const defined = new Set(list);
  return [...named].filter((id) => !defined.has(id));
};
export const unreferencedIds = (list: string[], text: string): string[] =>
  list.filter((id) => !text.includes(`'${id}'`) && !text.includes(`"${id}"`));
