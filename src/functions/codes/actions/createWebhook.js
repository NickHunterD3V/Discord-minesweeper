module.exports = {
    description: 'Creates a new webhook in a channel.',
    usage: 'name | avatar? | channelId? | returnData? | reason?',
    parameters: [
        {
            name: 'Name',
            description: 'The webhook name.',
            optional: 'false',
            defaultValue: 'none'
        },
        {
            name: 'Avatar',
            description: 'The webhook avatar.',
            optional: 'true',
            defaultValue: 'none'
        },
        {
            name: 'Channel ID',
            description: 'The channel to create the webhook.',
            optional: 'true',
            defaultValue: 'Current channel ID'
        },
        {
            name: 'Return Data',
            description: 'Whether to return the webhook ID and token or not.',
            optional: 'true',
            defaultValue: 'false'
        },
        {
            name: 'Reason',
            description: 'Reason to be shown in audit logs.',
            optional: 'true',
            defaultValue: 'false'
        }
    ],
    run: async (d, name, avatar, channelId = d.channel?.id, returnData = 'true', reason) => {
        if (name == undefined) return d.throwError.required(d, 'name')

        const channel = d.client.channels.cache.get(channelId)
        if (!channel) return d.throwError.invalid(d, 'channel ID', channelId)

        let newWebhook = await channel.createWebhook(name, {avatar, reason}).catch(e => d.throwError.func(d, e.message))

        return returnData === 'true' ? `${newWebhook?.id}/${newWebhook?.token}` : undefined
    }
}