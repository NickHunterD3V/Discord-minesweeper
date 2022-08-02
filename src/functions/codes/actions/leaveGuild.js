module.exports = {
    description: 'Makes the client leave a guild.',
    usage: 'guildId?',
    parameters: [
        {
            name: 'Guild ID',
            description: 'The guild which the client will leave.',
            optional: 'true',
            defaultValue: 'Current guild ID'
        }
    ],
    run: async (d, guildId = d.guild?.id) => {
        const guild = d.client.guilds.cache.get(guildId)
        if (!guild) return d.throwError.invalid(d, 'guild ID', guildId)

        await guild.leave().catch(e => d.throwError.func(d, e.message))
    }
}