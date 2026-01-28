import { FetchMode, FetchResult, BatchFetchResult } from "./types.js";
export declare function webFetch(url: string, mode?: FetchMode, searchPhrase?: string): Promise<FetchResult>;
export declare function batchFetch(urls: string[], mode?: FetchMode): Promise<BatchFetchResult>;
