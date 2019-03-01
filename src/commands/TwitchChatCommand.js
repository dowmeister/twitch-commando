const TwitchCommandoClient = require('../client/TwitchCommandoClient');
const TwitchChatMessage = require('../messages/TwitchChatMessage');

/**
 * Command argument
 * @typedef {Object} CommandArgument
 * @property {String} name Argument key name
 * @property {Object} type Argument type
 * @property {Object} defaultValue Argument default value
*/
 
/**
 * Command Options
 * @typedef {Object} CommandOptions
 * @property {String} name Command name
 * @property {Boolean} modOnly Restricted only to channel mods
 * @property {Boolean} ownerOnly Restricted only to bot owners
 * @property {Boolean} broadcasterOnly Restricted only to channel owner
 * @property {String} description Command description
 * @property {Array<String>} examples Command examples
 * @property {Array<CommandArgument>} args Arguments
 * @property {String} group Command group
 * @property {Array<String>} aliases Command aliases
 */

 /**
 * Base class to implement custom commands
 * @class
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