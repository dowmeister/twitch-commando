class TwtichChatChannel
{
    constructor(originalMessage, client)
    {
        this.originalMessage = originalMessage;
        this.client = client;
    }

    get name()
    {
        return this.originalMessage.channel;
    }

    get id()
    {
        return this.originalMessage.room_id;
    }

    async say(text)
    {
        this.say(this.name, text);
    }
}

module.exports = TwtichChatChannel;