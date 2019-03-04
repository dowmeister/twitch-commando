const TwitchChatChannel = require('../channels/TwitchChatChannel');
const TwitchChatUser = require('../users/TwitchChatUser');

/**
 * This class represents the chat message
 *
 * @class
 */
class TwitchChatMessage
{

    /**
     *Creates an instance of TwitchChatMessage.
     * @param {object} originalMessage
     * @param {String} channel
     * @param {TwitchCommandoClient} client
     * @memberof TwitchChatMessage
     */
    constructor(originalMessage, channel, client)
    {
        this.originalMessage = originalMessage;
        this.client = client;
        this._channel = new TwitchChatChannel({ channel: channel, room_id: originalMessage["room-id"] }, client);
        this._author = new TwitchChatUser(originalMessage, client);
        this._timestamp = new Date();
    }


    /**
     * Text of the message
     *
     * @readonly
     * @memberof TwitchChatMessage
     * @return {String}
     */
    get text()
    {
        return this.originalMessage.message;
    }


    /**
     * The author of the message
     * 
     * @readonly
     * @memberof TwitchChatMessage
     * @return {TwitchChatUser}
     */
    get author()
    {
        return this._author;
    }


    /**
     * The ID of the message
     *
     * @readonly
     * @memberof TwitchChatMessage
     * @return {String}
     */
    get id()
    {
        return this.originalMessage.id;
    }


    /**
     * The channel where the message has been sent in
     * 
     * @readonly
     * @memberof TwitchChatMessage
     * @return {TwitchChatChannel}
     */
    get channel()
    {
        return this._channel;
    }


    /**
     * Text color
     * 
     * @readonly
     * @memberof TwitchChatMessage
     * @return {String}
     */
    get color()
    {
        return this.originalMessage.color;
    }


    /**
     * Emotes contained in the message
     *
     * @readonly
     * @memberof TwitchChatMessage
     */
    get emotes()
    {
        return this.originalMessage.emotes;
    }


    /**
     * Message sent date
     *
     * @readonly
     * @memberof TwitchChatMessage
     * @return {Date}
     */
    get timestamp()
    {
        return this._timestamp;
    }


    /**
     * Message type
     *
     * @readonly
     * @memberof TwitchChatMessage
     * @return {String}
     */
    get messageType()
    {
        return this.originalMessage["message-type"]
    }


    /**
     * Helper method to reply quickly to a message. Create a message to send in the channel with @author <text>
     *
     * @param {String} text
     * @param {Boolean} addRandomEmote Add random emote to avoid message duplication
     * @memberof TwitchChatMessage
     * @async 
     */
    async reply(text, addRamndomEmote = false)
    {
        if (this.messageType == 'whisper')
            return this.client.whisper(this.author.username, text);
        else
            return this.client.say(this.channel.name, `@${this.author.username} ${text}`, addRamndomEmote);
    }


    /**
     * Helper method to reply quickly to a message with an action
     *
     * @async
     * @param {String} text
     * @param {Boolean} addRandomEmote Add random emote to avoid message duplication
     * @memberof TwitchChatMessage
     */
    async actionReply(text, addRamndomEmote = false)
    {
        return this.client.action(this.channel.name, `@${this.author.username} ${text}`, addRamndomEmote);
    }
}

module.exports = TwitchChatMessage;