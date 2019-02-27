const TwitchChatCommand = require('../commands/TwitchChatCommand');

module.exports = class PrefixCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'prefix',
            group: 'misc',
            description: "This command change the command prefix in current channel",
            broadcasterOnly: true,
            examples: [
                "!prefix <newprefix>"
            ],
            args: [
                {
                    name: 'newprefix',
                    type: String                   
                }
            ]
        });
    }

    async run(msg, { newprefix })
    {
        //console.log(msg.author);

        if (newprefix == '')
            return msg.reply('Prefix cannot be empty');

        if (newprefix == '/')
            return msg.reply('Prefix cannot be /');

        await this.client.settingsProvider.set(msg.channel.name, 'prefix', newprefix);

        return msg.reply('Prefix changed');
    }
}