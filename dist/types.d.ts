export type FetchMode = "full" | "truncated" | "selective";
export interface FetchResult {
    content: string;
    url: string;
    truncated: boolean;
    matchCount?: number;
}
export declare const FETCH_TIMEOUT_MS = 30000;
export declare const MAX_CONTENT_SIZE: number;
export declare const TRUNCATED_SIZE: number;
export declare const MAX_MATCHES = 10;
export declare const CONTEXT_LINES = 30;
export interface BatchFetchItem {
    url: string;
    content: string;
    truncated?: boolean;
    finalUrl?: string;
    error?: string;
}
export interface BatchFetchResult {
    total: number;
    successful: number;
    failed: number;
    items: BatchFetchItem[];
}
