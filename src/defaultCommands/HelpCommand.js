const TwitchChatCommand = require('../commands/TwitchChatCommand');

module.exports = class HelpCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'help',
            group: 'misc',
            description: "This command shows help for all commands. Send !help <command> for detailed help on a command",
            examples: [
                "!help", "!help <command>"
            ],
            args: [
                {
                    name: 'command',
                    type: String,
                    defaultValue: ''                    
                }
            ]
        });
    }

    async run(msg, { command })
    {
        var messageText = '';

        if (command == '')
        {
            messageText = 'Available commands: '

            var commands = new Array();

            for (let index = 0; index < this.client.commands.length; index++) {
                const c = this.client.commands[index];
                var prefix = await this.client.settingsProvider.get(msg.channel.name, 'prefix', this.client.options.prefix);

                commands.push(prefix + c.options.name);
            }

            messageText += commands.join(', ');

            return msg.author.whisper(messageText);
        }
        else
        {
            var selectedCommand = this.client.commands.find( (c) => { return c.options.name == command });

            if (selectedCommand)
            {
                messageText = command + ' command details: ' + selectedCommand.options.description;

                if (selectedCommand.options.examples && selectedCommand.options.examples.length > 0)
                {
                    messageText += ' - Examples: ' + selectedCommand.options.examples.join(', ');
                }

                return msg.author.whisper(messageText);
            }
            else
                return msg.actionReply('command not found.');
        }
    }
}