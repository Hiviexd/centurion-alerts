import { readFileSync, writeFileSync } from "fs";

/**
 * @param {string} cacheFilePath
 * @returns {Map<string, { ranked: number, username: string }>}
 */
export function loadCache(cacheFilePath) {
    try {
        const data = readFileSync(cacheFilePath, "utf8");
        return new Map(Object.entries(JSON.parse(data)));
    } catch {
        return new Map();
    }
}

/**
 * @param {string} cacheFilePath
 * @param {Map<string, { ranked: number, username: string }>} cache
 */
export function saveCache(cacheFilePath, cache) {
    const obj = Object.fromEntries(cache);
    writeFileSync(cacheFilePath, JSON.stringify(obj, null, 2));
}
