/** In-memory only. Route changes retain control of live jobs; reload discards credentials. */
export const localSession:{token:string;workbench?:Record<string,unknown>;workspace?:Record<string,unknown>}={token:''};
