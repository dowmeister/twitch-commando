const TwitchCommandoClient = require('../client/TwitchCommandoClient');
const CommandOptions = require('./CommandOptions');
/**
 * Base class to implement custom commands
 *
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
    async run(msg, parameters)
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
    async prepareRun(msg, parameters)
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
}

module.exports = TwichChatCommand;