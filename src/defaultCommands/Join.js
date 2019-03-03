const TwitchChatCommand = require('../commands/TwitchChatCommand');
const CommandoConstants = require('../client/CommandoConstants');

module.exports = class JoinCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'join',
            group: 'system',
            botChannelOnly: true,
            description: "This command request the bot to join the sender channel",
            examples: [
                "!join"
            ]
        });
    }

    async run(msg)
    {
        if (!this.client.options.enableJoinCommand)
            return msg.reply('Join command is not enabled', true);
        
        if (this.client.getChannels().includes(msg.author.channel))
            return msg.reply('The bot is already in your channel', true);

        //console.log(this.client.tmi.getChannels());
        
        await this.client.join(msg.author.channel);

        let channels = await this.client.settingsProvider.get(CommandoConstants.GLOBAL_SETTINGS_KEY, 'channels', []);
        channels.push(msg.author.channel);
        await this.client.settingsProvider.set(CommandoConstants.GLOBAL_SETTINGS_KEY, 'channels', channels);

        return msg.reply('Channel joined. Please ensure to make me mod after joined.', true);
    }
}