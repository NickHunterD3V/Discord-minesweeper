//dontParseParams

module.exports = {
    description: '',
    usage: '',
    parameters: [
        {
            name: '',
            description: '',
            optional: 'false',
            defaultValue: 'none'
        },
        {
            name: '',
            description: '',
            optional: 'false',
            defaultValue: 'none'
        },
        {
            name: '',
            description: '',
            optional: 'false',
            defaultValue: 'none'
        }
    ],
    run: async d => {
        let [ms, errorMsg, guildId = d.guild?.id, channelId = d.channel?.id] = d.function.parameters;

        if (ms == undefined) return d.throwError.func(d, `miliseconds field is required`)

        const parsedMs = await d.reader.default(d, ms)
        if (parsedMs?.error) return;
        
        ms = parsedMs.result

        const parsedChannelId = await d.reader.default(d, channelId)
        if (parsedChannelId?.error) return;
        
        channelId = parsedChannelId.result

        const parsedGuildId = await d.reader.default(d, guildId)
        if (parsedGuildId?.error) return;
        
        guildId = parsedGuildId.result

        if (isNaN(ms) || Number(ms) < 1) return d.throwError.invalid(d, 'miliseconds', ms)

        const guild = d.client.guilds.cache.get(guildId)
        if (!guild) return d.throwError.invalid(d, 'guild ID', guildId)

        let time = d.internalDb.get('cooldown', `_guild_${d.command.name}_${guildId}`)
        let remainingTime = time - Date.now();

        if (!time || remainingTime < 1) {
            d.internalDb.set('cooldown', Date.now() + Number(ms), `_guild_${d.command.name}_${guildId}`)
        } else {
            const channel = d.client.channels.cache.get(channelId)
            if (!channel) return d.throwError.invalid(d, 'channel ID', channelId)

            errorMsg = errorMsg.replaceAll('{%time}', remainingTime)

            await d.sendParsedMessage(d, errorMsg, channel)

            d.error = true
        }
    }
}