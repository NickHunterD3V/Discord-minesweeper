module.exports = async d => {
    let [name, dbName, guildId = d.guild?.id] = d.function.parameters;

    let database = d.databases[dbName]

    if (!database) return d.throwError.invalid(d, 'database name', dbName)

    if (!database.entries[name]) return d.throwError.func(d, `entry "${name}" is not set in database "${dbName}"`)

    if (!d.client.guilds.cache.has(guildId)) return d.throwError.invalid(d, 'guild ID', guildId)

    return database.get(name, `_guild_${guildId}`)
};