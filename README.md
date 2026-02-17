# centurion-alerts

pings you on discord when someone in the [osekai ranked mapsets leaderboard](https://osekai.net/rankings/?ranking=Mappers&type=Ranked+Mapsets) hits 100 ranked maps (a.k.a. becomes a centurion).

## setup

1. copy `config.example.json` to `config.json` and fill in:
   - `userCountThreshold`: the number of users to check for new centurions (default: `100`)
   - `emptyRunNotification`: whether to send a notification when no centurions are found (default: `true`)
   - `osekaiApiUrl`: the osekai rankings api endpoint
   - `discord.webhookUrl`: your discord webhook url
   - `discord.userId`: your discord user id if you want to be pinged on alerts

2. run using `node index.js` or the `start` script through your package manager of choice, no dependencies needed (apart from node.js but you already knew that)

> [!NOTE]
> the first run won’t send centurion alerts — it just builds the cache so the next run has something to compare against.

> [!IMPORTANT]
> this script is intended to be run on a schedule (e.g. cron).
