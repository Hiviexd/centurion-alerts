import path from "path";
import { fileURLToPath } from "url";
import config from "./config.json" with { type: "json" };
import { cacheExists, loadCache, saveCache } from "./lib/cache.js";
import { sendCenturionEmbed, sendFinishedProcessingEmbed, sendInitialCacheEmbed } from "./lib/discord.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = config.osekaiApiUrl;
const CACHE_FILE = path.join(dirname, "cache.json");
const WEBHOOK_URL = config.discord?.webhookUrl;
const DISCORD_USER_ID = config.discord?.userId;

if (!API_URL || API_URL.length === 0 || !WEBHOOK_URL || WEBHOOK_URL.length === 0) {
    console.error("No API URL or webhook URL provided");
    process.exit(1);
}

async function fetchRankings() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "App=Ranked Mapsets",
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

const top100 = (await fetchRankings().catch((err) => {
    console.error("Fetch failed:", err);
    process.exit(1);
})).slice(0, 100);

if (!cacheExists(CACHE_FILE)) {
    console.log(
        "No cache found. Created initial cache from current rankings. Future runs will check for new centurions.",
    );
    const cache = new Map();
    for (const row of top100) {
        cache.set(String(row.userid), {
            ranked: parseInt(row.ranked, 10),
            username: row.username,
        });
    }
    saveCache(CACHE_FILE, cache);
    if (WEBHOOK_URL) {
        await sendInitialCacheEmbed(WEBHOOK_URL, DISCORD_USER_ID);
    }
    process.exit(0);
}

const cache = loadCache(CACHE_FILE);
let centurionCount = 0;

for (const row of top100) {
    const userid = String(row.userid);
    const ranked = parseInt(row.ranked, 10);
    const prev = cache.get(userid);
    const prevRanked = prev !== undefined ? prev.ranked : null;

    if (ranked >= 100 && (prevRanked === null || prevRanked < 100)) {
        console.log(`${row.username} (id: ${userid}) reached 100 ranked mapsets`);
        centurionCount++;

        await sendCenturionEmbed(
            WEBHOOK_URL,
            { username: row.username, userid, countrycode: row.countrycode },
            DISCORD_USER_ID,
        ).catch((err) => {
            console.error("Discord webhook error:", err);
        });
    }
}

console.log(`Found ${centurionCount} users who reached 100 ranked mapsets`);

if (centurionCount === 0) {
    await sendFinishedProcessingEmbed(WEBHOOK_URL, centurionCount).catch((err) => {
        console.error("Discord webhook error:", err);
    });
}

cache.clear();
for (const row of top100) {
    cache.set(String(row.userid), {
        ranked: parseInt(row.ranked, 10),
        username: row.username,
    });
}
saveCache(CACHE_FILE, cache);
