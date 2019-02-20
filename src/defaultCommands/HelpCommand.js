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

    async run(msg, parameters)
    {
        var messageText = `\`\`\`To run a command in ${msg.channel.name}, use !command or @${this.client.tmi.username} command. For example, !prefix or @${this.client.tmi.username} prefix.\n\r
        To run a command in this DM, simply use command with no prefix.\n\r
        
        Use help <command> to view detailed information about a specific command.\n\r
        Use help all to view a list of all commands, not just available ones.\n\r\n\r`;

        this.client.commands.forEach( (c) => {

            messageText += `*${c.options.name}* - ${this.options.description}\n\r`;
        });

        messageText += "```";

        msg.author.whisper(messageText);
    }
}