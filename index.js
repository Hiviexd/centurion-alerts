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
const USER_COUNT_THRESHOLD = config.userCountThreshold || 100;

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

const userList = (
    await fetchRankings().catch((err) => {
        console.error("Fetch failed:", err);
        process.exit(1);
    })
).slice(0, USER_COUNT_THRESHOLD);

if (!cacheExists(CACHE_FILE)) {
    console.log(
        "No cache found. Created initial cache from current rankings. Future runs will check for new centurions.",
    );
    const cache = new Map();
    for (const row of userList) {
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

for (const row of userList) {
    const userid = String(row.userid);
    const ranked = parseInt(row.ranked, 10);
    const prev = cache.get(userid);
    const prevRanked = prev !== undefined ? prev.ranked : null;

    const milestone = Math.floor(ranked / 100) * 100;
    if (milestone >= 100 && (prevRanked === null || prevRanked < milestone)) {
        console.log(`${row.username} (id: ${userid}) reached ${milestone} ranked mapsets`);
        centurionCount++;

        await sendCenturionEmbed(
            WEBHOOK_URL,
            { username: row.username, userid, countrycode: row.countrycode },
            milestone,
            DISCORD_USER_ID,
        ).catch((err) => {
            console.error("Discord webhook error:", err);
        });
    }
}

console.log(`Found ${centurionCount} user(s) who reached a new 100-map milestone`);

if (centurionCount === 0) {
    await sendFinishedProcessingEmbed(WEBHOOK_URL, centurionCount).catch((err) => {
        console.error("Discord webhook error:", err);
    });
}

cache.clear();
for (const row of userList) {
    cache.set(String(row.userid), {
        ranked: parseInt(row.ranked, 10),
        username: row.username,
    });
}
saveCache(CACHE_FILE, cache);
