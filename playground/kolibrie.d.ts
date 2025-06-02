/* tslint:disable */
/* eslint-disable */
export class SparqlDatabase {
  free(): void;
  constructor();
  add_triple_parts(subject: string, predicate: string, object: string): void;
  parse_turtle(turtle_data: string): void;
  parse_n3(n3_data: string): void;
  parse_rdf(rdf_xml: string): void;
  parse_rdf_simple(rdf_xml: string): void;
  generate_rdf_xml(): string;
  handle_query(query: string): string;
  handle_update(update: string): string;
  handle_http_request(request: string): string;
  debug_print_triples(): void;
  register_prefixes_from_query(query: string): void;
  build_all_indexes(): void;
  execute_sparql_query(query: string): string;
  execute_sparql_query_as_table(query: string): Array<any>;
  process_rule_definition(rule_input: string): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_sparqldatabase_free: (a: number, b: number) => void;
  readonly sparqldatabase_new: () => number;
  readonly sparqldatabase_add_triple_parts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly sparqldatabase_parse_turtle: (a: number, b: number, c: number) => void;
  readonly sparqldatabase_parse_n3: (a: number, b: number, c: number) => void;
  readonly sparqldatabase_parse_rdf: (a: number, b: number, c: number) => void;
  readonly sparqldatabase_parse_rdf_simple: (a: number, b: number, c: number) => void;
  readonly sparqldatabase_generate_rdf_xml: (a: number) => [number, number];
  readonly sparqldatabase_handle_query: (a: number, b: number, c: number) => [number, number];
  readonly sparqldatabase_handle_update: (a: number, b: number, c: number) => [number, number];
  readonly sparqldatabase_handle_http_request: (a: number, b: number, c: number) => [number, number];
  readonly sparqldatabase_debug_print_triples: (a: number) => void;
  readonly sparqldatabase_register_prefixes_from_query: (a: number, b: number, c: number) => void;
  readonly sparqldatabase_build_all_indexes: (a: number) => void;
  readonly sparqldatabase_execute_sparql_query: (a: number, b: number, c: number) => [number, number];
  readonly sparqldatabase_execute_sparql_query_as_table: (a: number, b: number, c: number) => any;
  readonly sparqldatabase_process_rule_definition: (a: number, b: number, c: number) => [number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
