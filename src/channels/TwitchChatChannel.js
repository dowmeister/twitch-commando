/**
 * Twitch Channel object
 * 
 * @class
 */
class TwtichChatChannel
{

    /**
     * Creates an instance of TwtichChatChannel.
     * @param {TwitchChatMessage} originalMessage
     * @param {TwitchCommandoClient} client
     * @memberof TwtichChatChannel
     */
    constructor(/** @type {TwitchChatMessage} */ originalMessage, /** @type {TwitchCommandoClient} */ client)
    {
        this.originalMessage = originalMessage;
        this.client = client;
    }


    /**
     * Channel name
     *
     * @readonly
     * @memberof TwtichChatChannel
     */
    get name()
    {
        return this.originalMessage.channel;
    }


    /**
     * Channel ID
     *
     * @readonly
     * @memberof TwtichChatChannel
     */
    get id()
    {
        return this.originalMessage.room_id;
    }


    /**
     * Send text message in the channel
     * 
     * @async
     * @param {String} text Message text
     * @memberof TwtichChatChannel
     */
    async say(text)
    {
        this.say(this.name, text);
    }
}

module.exports = TwtichChatChannel;