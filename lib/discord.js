/**
 * Sends a centurion alert embed to a Discord webhook.
 * Optionally pings a Discord user (e.g. from config or osu userid → Discord id mapping).
 *
 * @param {string} webhookUrl
 * @param {{ username: string, userid: string, countrycode: string }} centurion - osu! user info
 * @param {string} [discordUserId] - Discord user ID to ping in the message (e.g. <@123...>)
 */
export async function sendCenturionEmbed(webhookUrl, centurion, discordUserId) {
    const content = discordUserId && discordUserId.length ? `<@${discordUserId}>` : null;
    const embed = {
        title: "New Centurion",
        description: `:flag_${centurion.countrycode.toLowerCase()}: [**${centurion.username}**](https://osu.ppy.sh/users/${centurion.userid}) reached 100 ranked mapsets!!!!!!!`,
        color: parseInt("fec820", 16), // #fec820
    };

    const body = JSON.stringify({
        content,
        embeds: [embed],
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
}
