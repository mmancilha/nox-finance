/**
 * @nox/shared-types
 * Tipos compartilhados entre apps/web (Next.js) e apps/api (FastAPI via OpenAPI).
 *
 * Convenção: toda entidade do domínio Nox vive aqui. O backend expõe OpenAPI,
 * e estes tipos servem como contrato TypeScript no frontend.
 */

export * from './agents.js';
export * from './finance.js';
