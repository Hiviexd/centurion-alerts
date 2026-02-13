/**
 * Sends a message and/or embeds to a Discord webhook.
 *
 * @param {string} webhookUrl
 * @param {{ content?: string | null, embeds?: object[] }} options
 * @returns {Promise<void>}
 */
export async function sendEmbed(webhookUrl, { content = null, embeds = [] }) {
    const body = JSON.stringify({
        content: content ?? null,
        embeds: embeds.length ? embeds : undefined,
    });

    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Discord webhook failed ${res.status}: ${text}`);
    }

    // 1s sleep
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * Sends a centurion/milestone alert embed.
 *
 * @param {string} webhookUrl
 * @param {{ username: string, userid: string, countrycode: string }} centurion
 * @param {number} milestone - e.g. 100, 200, 300
 * @param {string} [discordUserId]
 */
export async function sendCenturionEmbed(webhookUrl, centurion, milestone, discordUserId) {
    const content = discordUserId?.length ? `<@${discordUserId}>` : null;
    const embed = {
        title: milestone === 100 ? "New Centurion" : `${milestone} ranked mapsets`,
        description: `:flag_${centurion.countrycode.toLowerCase()}: [**${centurion.username}**](https://osu.ppy.sh/users/${centurion.userid}) has reached **${milestone}** ranked mapsets!!!!!!!`,
        color: 0xfec820,
    };
    try {
        await sendEmbed(webhookUrl, { content, embeds: [embed] });
    } catch (err) {
        console.error("Discord webhook error:", err);
    }
}

/**
 * Sends a "finished processing" summary embed.
 *
 * @param {string} webhookUrl
 * @param {number} userCount - Number of new milestones reached
 */
export async function sendFinishedProcessingEmbed(webhookUrl, userCount) {
    const embed = {
        description: `Finished processing. **${userCount}** user${userCount === 1 ? "" : "s"} reached a new 100-map milestone.`,
        color: 0x5865f2,
    };
    try {
        await sendEmbed(webhookUrl, { embeds: [embed] });
    } catch (err) {
        console.error("Discord webhook error:", err);
    }
}

/**
 * Sends an embed for initial run (no cache): cache was created, no centurion checks.
 *
 * @param {string} webhookUrl
 * @param {string} [discordUserId]
 */
export async function sendInitialCacheEmbed(webhookUrl, discordUserId) {
    const content = discordUserId?.length ? `<@${discordUserId}>` : null;
    const embed = {
        description: "No cache was found. Initialized cache from current rankings. Future runs will check for new centurions.",
        color: 0x57f287,
    };
    try {
        await sendEmbed(webhookUrl, { content, embeds: [embed] });
    } catch (err) {
        console.error("Discord webhook error:", err);
    }
}
