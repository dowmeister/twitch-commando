const TwitchChatCommand = require('../src/commands/TwitchChatCommand');

module.exports = class SimpleCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'simple',
            aliases: [ 'simpleCommand' ],
            group: 'misc',
            description: 'This is a simple command, the bot will reply with "roger!"',
            args: [
                {
                    name: 'arg1',
                    defaultValue: 'defaultValueArg1'
                },
                {
                    name: 'arg2'
                }
            ]
        });
    }

    async run(msg, parameters)
    {
        console.log(parameters);

        msg.reply('roger!');
    }
}