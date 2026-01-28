export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedDate?: string;
    isPublicDomain: boolean;
    id: string;
    domain: string;
}
export interface BatchSearchItem {
    query: string;
    results: SearchResult[];
    error?: string;
}
export interface BatchSearchResult {
    total: number;
    successful: number;
    failed: number;
    items: BatchSearchItem[];
}
export declare const kiroSearch: (query: string, maxResults?: number) => Promise<SearchResult[]>;
export declare const kiroBatchSearch: (queries: string[], maxResultsPerQuery?: number) => Promise<BatchSearchResult>;
