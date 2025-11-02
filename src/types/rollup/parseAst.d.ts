declare module 'rollup/parseAst' {
  export function parseAst(...args: unknown[]): unknown;
  export function parseAstAsync(...args: unknown[]): Promise<unknown>;
}
