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
        let [messageId = d.message?.id] = d.function.parameters;

        d.data.messageToReply = messageId;
    }
}