import path from "path";
import { fileURLToPath } from "url";
import config from "./config.json" with { type: "json" };
import { loadCache, saveCache } from "./lib/cache.js";
import { sendCenturionEmbed } from "./lib/discord.js";

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

const cache = loadCache(CACHE_FILE);

const list = await fetchRankings().catch((err) => {
    console.error("Fetch failed:", err);
    process.exit(1);
});

const top100 = list.slice(0, 100);
let count = 0;

for (const row of top100) {
    const userid = String(row.userid);
    const ranked = parseInt(row.ranked, 10);
    const prev = cache.get(userid);
    const prevRanked = prev !== undefined ? prev.ranked : null;

    if (ranked >= 100 && (prevRanked === null || prevRanked < 100)) {
        console.log(`${row.username} (id: ${userid}) reached 100 ranked mapsets`);
        count++;
        if (WEBHOOK_URL) {
            try {
                await sendCenturionEmbed(
                    WEBHOOK_URL,
                    { username: row.username, userid, countrycode: row.countrycode },
                    DISCORD_USER_ID,
                );
            } catch (err) {
                console.error("Discord webhook error:", err);
            }
        }
    }
}

console.log(`Found ${count} users who reached 100 ranked mapsets`);

cache.clear();
for (const row of top100) {
    cache.set(String(row.userid), {
        ranked: parseInt(row.ranked, 10),
        username: row.username,
    });
}
saveCache(CACHE_FILE, cache);
