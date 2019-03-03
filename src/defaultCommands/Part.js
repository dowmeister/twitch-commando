const TwitchChatCommand = require('../commands/TwitchChatCommand');
const CommandoConstants = require('../client/CommandoConstants');

module.exports = class PartCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'part',
            group: 'system',
            botChannelOnly: true,
            description: "This command request the bot to leave the sender channel",
            examples: [
                "!part"
            ]
        });
    }

    async run(msg)
    {
        if (!this.client.options.enableJoinCommand)
            return msg.reply('Part command is not enabled', true);
        
        if (!this.client.getChannels().includes(msg.author.channel))
            return msg.reply('The bot is not in your channel', true);

        //console.log(this.client.tmi.getChannels());
        
        await this.client.part(msg.author.channel);
        
        let channels = await this.client.settingsProvider.get(CommandoConstants.GLOBAL_SETTINGS_KEY, 'channels', []);
        channels = channels.filter( (c) => { return c != msg.author.channel });
        await this.client.settingsProvider.set(CommandoConstants.GLOBAL_SETTINGS_KEY, 'channels', channels);

        return msg.reply('Channel left.', true);
    }
}