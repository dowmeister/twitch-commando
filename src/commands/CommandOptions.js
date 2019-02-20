
/**
 * Command options
 *
 * @class CommandOptions
 */
class CommandOptions
{

    /**
     *Creates an instance of CommandOptions.
     * @param {object} options
     * @memberof CommandOptions
     */
    constructor(options)
    {
        this.options = options;
        /** @ignore */
        this._modOnly = false;
        /** @ignore */
        this._ownerOnly = false;
    }


    /**
     * Command name
     *
     * @readonly
     * @memberof CommandOptions
     * @return {String}
     */
    get name()
    {
        return this.options.name;
    }


    /**
     * Command aliases
     *
     * @readonly
     * @memberof CommandOptions
     * @return {Array}
     */
    get aliases()
    {
        return this.options.aliases;
    }


    /**
     * Command description
     *
     * @readonly
     * @memberof CommandOptions
     * @return {String}
     */
    get description()
    {
        return this.options.description;
    }


    /**
     * Command arguments
     *
     * @readonly
     * @memberof CommandOptions
     * @return {Array}
     */
    get args()
    {
        return this.options.args;
    }


    /**
     * Command group
     *
     * @readonly
     * @memberof CommandOptions
     * @return {String}
     */
    get group()
    {
        return this.options.group;
    }


    /**
     * Denotes if the command is restricted to mods
     *
     * @readonly
     * @memberof CommandOptions
     */
    get modOnly()
    {
        return this._modOnly;
    }


    /**
     * Denotes if the command is restricted to owners only
     *
     * @readonly
     * @memberof CommandOptions
     */
    get ownerOnly()
    {
        return this._ownerOnly;
    }
}

module.exports = CommandOptions;