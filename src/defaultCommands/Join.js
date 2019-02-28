const TwitchChatCommand = require('../commands/TwitchChatCommand');

module.exports = class JoinCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'join',
            group: 'misc',
            description: "This command request the bot to join the sender channel",
            examples: [
                "!join"
            ]
        });
    }

    async run(msg)
    {
        if (!this.client.options.enableJoinCommand)
            return msg.reply('Join command is not enabled');
        
        if (msg.channel.name != '#' + this.client.getUsername())
            return msg.reply('This command can be executed only in the bot channel. Please head to https://twitch.tv/' + this.client.tmi.getUsername());
        
        if (this.client.getChannels().includes('#'+ msg.author.username))
            return msg.reply('The bot is already in your channel');

        //console.log(this.client.tmi.getChannels());
        
        await this.client.join('#' + msg.author.username);

        let channels = await this.client.settingsProvider.get('global', 'channels', []);
        channels.push('#' + msg.author.username);
        await this.client.settingsProvider.set('global', 'channels', channels);

        return msg.reply('Channel joined');
    }
}