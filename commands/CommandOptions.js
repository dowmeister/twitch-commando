class CommandOptions
{
    constructor(options)
    {
        this.options = options;
    }

    get name()
    {
        return this.options.name;
    }

    get aliases()
    {
        return this.options.aliases;
    }

    get description()
    {
        return this.options.description;
    }

    get parameters()
    {
        return this.options.parameters;
    }

    get group()
    {
        return this.options.group;
    }
}

export default CommandOptions;