const TwitchCommandoClient = require('../client/TwitchCommandoClient');
const TwitchChatMessage = require('../messages/TwitchChatMessage');

/**
 * Base class to implement custom commands
 *
 * @class TwichChatCommand
 */

/**
 * Command argument
 * @typedef {Object} CommandArgument
 * @property {String} name
 * @property {Object} type
 * @property {Object} defaultValue
*/
 
/**
 * Command Options
 * @typedef {Object} CommandOptions
 * @property {String} name
 * @property {Boolean} modOnly
 * @property {Boolean} ownerOnly
 * @property {Boolean} broadcasterOnly
 * @property {String} description
 * @property {Array<String>} examples
 * @property {Array<CommandArgument>} args
 * @property {String} group
 * @property {Array<String>} aliases
 */

 /**
 * @class TwichChatCommand
 */
class TwichChatCommand
{

    /**
     *Creates an instance of TwichChatCommand.
     * @param {TwitchCommandoClient} client The TwitchCommandoClient
     * @param {CommandOptions} options Command options
     * @memberof TwichChatCommand
     */
    constructor(/** @type {TwitchCommandoClient} */ client, /** @type {CommandOptions} */ options)
    {
        this.options = options;
        this.client = client;
    }
    
    /**
     * Method called when command is executed
     *
     * @param {TwitchChatMessage} msg Message received
     * @param {object} parameters Arguments parsed
     * @memberof TwichChatCommand
     * @async
     */
    async run(/** @type {TwitchChatMessage} */ msg, parameters)
    {

    }


    /**
     * Prepare the command to be executed
     *
     * @param {TwitchChatMessage} msg Message sent
     * @param {Array} parameters Message arguments
     * @memberof TwichChatCommand
     * @async
     * @private
     */
    async prepareRun(/** @type {TwitchChatMessage} */ msg, parameters)
    {
        var namedParameters = {};

        if (this.options.args && this.options.args.length > 0)
        {
            for (var i = 0; i < this.options.args.length; i++)
            {
                if (typeof parameters[i] != 'undefined')
                {
                    namedParameters[this.options.args[i].name] = parameters[i];
                }
                else
                {
                    if (this.options.args[i].defaultValue != undefined)
                        namedParameters[this.options.args[i].name] = this.options.args[i].defaultValue;
                    else
                        namedParameters[this.options.args[i].name] = '';
                }
            }
        }

        await this.run(msg, namedParameters);
    }

    preValidate(/** @type {TwitchChatMessage} */ msg)
    {
        if (this.options.ownerOnly && this.client.botOwners != undefined 
            && this.client.botOwners.length > 0 
            && !this.client.options.botOwners.includes(msg.author.name))
            return 'This command can be executed only from bot owners';

        if (this.options.modOnly)
        {
            if ( (msg.author.badges && msg.author.badges.broadcaster != '1') || !msg.author.mod)
                return 'This command can be executed only from a mod or the broadcaster';
        }        

        if (this.options.broadcasterOnly)
        {
            if (msg.author.badges && msg.author.badges.broadcaster != '1')
                return 'This command can be executed only from the broadcaster';
        }

        return '';
    }
}

module.exports = TwichChatCommand;