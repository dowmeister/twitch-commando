class TwichChatCommand
{
    constructor(client, options)
    {
        this.options = options;
        this.client = client;
    }
    
    async run(msg, parameters)
    {

    }

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

        this.run(msg, namedParameters);
    }
}

module.exports = TwichChatCommand;