
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
     * @async
     * @memberof TwitchChatUser
     */
    async whisper(message)
    {
        return this.client.whisper(this.username, message);
    }

    /**
     * Get the user channel
     * 
     * @returns {String} Channel name
     * @readonly
     * @memberof TwitchChatUser
     */
    get channel()
    {
        return '#' + this.username;
    }

    /**
     * Check if user is the channel broadcaster
     * 
     * @returns {Boolean} True if the user is the broadcaster
     * @readonly
     * @memberof TwitchChatUser
     */
    get isBroadcaster()
    {
        return (this.badges != undefined  && this.badges.broadcaster == '1');
    }
}

module.exports = TwitchChatUser;