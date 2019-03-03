const TwitchChatCommand = require('../commands/TwitchChatCommand');
const CommandoConstants = require('../client/CommandoConstants');

module.exports = class EvalCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'eval',
            group: 'system',
            botChannelOnly: true,
            ownerOnly: true,
            hideFromHelp: true,
            description: "This command eval arbitrary code",
            examples: [
                "!eval"
            ]
        });
    }

    async run(msg)
    {
    }
}