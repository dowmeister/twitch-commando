const TwitchChatChannel = require('../channels/TwitchChatChannel');
const TwitchChatUser = require('../users/TwitchChatUser');

class TwitchChatMessage
{
    constructor(originalMessage, channel, client)
    {
        this.originalMessage = originalMessage;
        this.client = client;
        this._channel = new TwitchChatChannel({ channel: channel, room_id: originalMessage["room-id"] }, client);
        this._author = new TwitchChatUser(originalMessage, client);
        this._timestamp = new Date();
    }

    get text()
    {
        return this.originalMessage.message;
    }

    get author()
    {
        return this._author;
    }

    get id()
    {
        return this.originalMessage.id;
    }

    get channel()
    {
        return this._channel;
    }

    get color()
    {
        return this.originalMessage.color;
    }

    get emotes()
    {
        return this.originalMessage.emotes;
    }

    get timestamp()
    {
        return this._timestamp;
    }

    get messageType()
    {
        return this.originalMessage["message-type"]
    }

    async reply(text)
    {
        this.client.say(this.channel.name, `@${this.author.username} ${text}`);
    }
}

module.exports = TwitchChatMessage;