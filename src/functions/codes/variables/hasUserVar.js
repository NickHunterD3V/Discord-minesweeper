module.exports = async d => {
    let [name, dbName, userId = d.author?.id] = d.function.parameters;

    let database = d.databases[dbName]

    if (!database) return d.throwError.invalid(d, 'database name', dbName)

    if (!database.entries[name]) return d.throwError.func(d, `entry "${name}" is not set in database "${dbName}"`)

    if (!d.client.users.cache.has(userId)) return d.throwError.invalid(d, 'user ID', userId)

    return database.has(name, `_user_${userId}`)
};