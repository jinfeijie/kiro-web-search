import axios from "axios";
import axiosRetry from "axios-retry";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { FETCH_TIMEOUT_MS, MAX_CONTENT_SIZE, TRUNCATED_SIZE, MAX_MATCHES, CONTEXT_LINES } from "./types.js";
const MAX_FETCH_CONCURRENCY = 10;
const client = axios.create({
    timeout: FETCH_TIMEOUT_MS,
    maxRedirects: 5,
    maxContentLength: MAX_CONTENT_SIZE,
    headers: {
        "User-Agent": "KiroIDE/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate"
    },
    decompress: true
});
axiosRetry(client, {
    retries: 1,
    retryCondition: (e) => {
        const s = e.response?.status;
        if (s && s >= 400 && s < 500)
            return false;
        return axiosRetry.isNetworkOrIdempotentRequestError(e) || (s !== undefined && s >= 500);
    },
    retryDelay: axiosRetry.exponentialDelay
});
function isValidUrl(url) {
    try {
        return new URL(url).protocol === "https:";
    }
    catch {
        return false;
    }
}
function stripQuery(url) {
    try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}${u.pathname}`;
    }
    catch {
        return url;
    }
}
function extractContent(html) {
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (!article)
        return "Could not extract readable content.";
    const title = article.title || "";
    const text = article.textContent || "";
    return title ? `${title}\n\n${text}` : text;
}
function extractSelective(html, phrase) {
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    let text;
    if (article) {
        text = article.textContent || "";
    }
    else {
        const doc = dom.window.document;
        doc.querySelectorAll("script,style,noscript,nav,header,footer,aside").forEach(el => el.remove());
        text = doc.body?.textContent || "";
    }
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const lower = phrase.toLowerCase();
    const matches = lines
        .map((line, i) => line.toLowerCase().includes(lower) ? i : -1)
        .filter(i => i !== -1)
        .slice(0, MAX_MATCHES);
    if (matches.length === 0) {
        return { content: `No matches found for: "${phrase}"`, matchCount: 0 };
    }
    const sections = [];
    let lastEnd = -1;
    for (const idx of matches) {
        const start = Math.max(0, idx - CONTEXT_LINES);
        const end = Math.min(lines.length - 1, idx + CONTEXT_LINES);
        if (start > lastEnd + 1 && sections.length > 0)
            sections.push("\n...\n");
        sections.push(...lines.slice(Math.max(start, lastEnd + 1), end + 1));
        lastEnd = end;
    }
    return { content: sections.join("\n"), matchCount: matches.length };
}
function truncate(content, maxBytes) {
    const bytes = Buffer.byteLength(content, "utf8");
    if (bytes <= maxBytes)
        return { content, truncated: false };
    const chars = Math.floor(maxBytes / 2);
    return { content: content.slice(0, chars), truncated: true };
}
export async function webFetch(url, mode = "truncated", searchPhrase) {
    if (!isValidUrl(url))
        throw new Error("Invalid URL: Only HTTPS allowed");
    const cleanUrl = stripQuery(url);
    const response = await client.get(cleanUrl, { responseType: "text" });
    const html = response.data;
    const finalUrl = response.request?.res?.responseUrl || cleanUrl;
    if (mode === "selective") {
        if (!searchPhrase)
            throw new Error("searchPhrase required for selective mode");
        const { content, matchCount } = extractSelective(html, searchPhrase);
        return { content, url: finalUrl, truncated: false, matchCount };
    }
    const content = extractContent(html);
    const maxSize = mode === "full" ? MAX_CONTENT_SIZE : TRUNCATED_SIZE;
    const { content: final, truncated } = truncate(content, maxSize);
    return { content: final, url: finalUrl, truncated };
}
export async function batchFetch(urls, mode = "truncated") {
    const uniqueUrls = [...new Set(urls.filter(u => u.trim() && isValidUrl(u)))];
    if (uniqueUrls.length === 0)
        return { total: 0, successful: 0, failed: 0, items: [] };
    const tasks = uniqueUrls.map(url => async () => {
        try {
            const result = await webFetch(url, mode);
            return { url, content: result.content, truncated: result.truncated, finalUrl: result.url };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return { url, content: "", error: msg };
        }
    });
    const items = [];
    for (let i = 0; i < tasks.length; i += MAX_FETCH_CONCURRENCY) {
        const batch = tasks.slice(i, i + MAX_FETCH_CONCURRENCY);
        const results = await Promise.allSettled(batch.map(t => t()));
        for (const r of results) {
            if (r.status === "fulfilled")
                items.push(r.value);
            else
                items.push({ url: uniqueUrls[items.length], content: "", error: String(r.reason) });
        }
    }
    const successful = items.filter(i => !i.error && i.content).length;
    const failed = items.filter(i => i.error).length;
    return { total: uniqueUrls.length, successful, failed, items };
}
//# sourceMappingURL=web_fetch.js.map