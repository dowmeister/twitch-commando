class TwitchChatUser
{
    constructor(originalMessage, client)
    {
        this.originalMessage = originalMessage;
        this.client = client;        
    }

    get name()
    {
        return this.originalMessage["display_name"];
    }

    get username()
    {
        return this.originalMessage.username;
    }

    get mod()
    {
        return this.originalMessage.mod;
    }

    get badges()
    {
        return this.originalMessage.badges;
    }

    get subscriber()
    {
        return this.originalMessage.subscriber;
    }

    get id()
    {
        return this.originalMessage["user_id"];
    }

    get userType()
    {
        return this.originalMessage["user-type"];
    }

    get turbo()
    {
        return this.originalMessage.turbo;
    }

    whisper(message)
    {
        this.client.tmi.whisper(this.username, message);
    }
}

module.exports = TwitchChatUser;