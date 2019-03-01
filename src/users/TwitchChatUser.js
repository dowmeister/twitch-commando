
/**
 * This class represents a chat user
 *
 * @class
 */
class TwitchChatUser
{

    /**
     * Creates an instance of TwitchChatUser.
     * @param {Object} originalMessage
     * @param {TwitchCommandoClient} client
     * @memberof TwitchChatUser
     */
    constructor(originalMessage, client)
    {
        this.originalMessage = originalMessage;
        this.client = client;        
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get name()
    {
        return this.originalMessage["display_name"];
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get username()
    {
        return this.originalMessage.username;
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get mod()
    {
        return this.originalMessage.mod;
    }

  
    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get badges()
    {
        return this.originalMessage.badges;
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get subscriber()
    {
        return this.originalMessage.subscriber;
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get id()
    {
        return this.originalMessage["user_id"];
    }

    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get userType()
    {
        return this.originalMessage["user-type"];
    }


    /**
     *
     *
     * @readonly
     * @memberof TwitchChatUser
     */
    get turbo()
    {
        return this.originalMessage.turbo;
    }


    /**
     * Whisper a message to the user
     *
     * @param {String} message Message Text
     * @memberof TwitchChatUser
     */
    whisper(message)
    {
        this.client.tmi.whisper(this.username, message);
    }
}

module.exports = TwitchChatUser;