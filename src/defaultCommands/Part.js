const TwitchChatCommand = require('../commands/TwitchChatCommand');

module.exports = class PartCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'part',
            group: 'misc',
            description: "This command request the bot to leave the sender channel",
            examples: [
                "!part"
            ]
        });
    }

    async run(msg)
    {
        if (!this.client.options.enableJoinCommand)
            return msg.reply('Part command is not enabled');
        
        if (msg.channel.name != '#' + this.client.getUsername())
            return msg.reply('This channel can be executed only in the bot channel. Please head to https://twitch.tv/' + this.client.getUsername());
        
        if (!this.client.getChannels().includes('#'+ this.client.getUsername()))
            return msg.reply('The bot is not in your channel');

        //console.log(this.client.tmi.getChannels());
        
        await this.client.part('#' + msg.author.username);

        return msg.reply('Channel left');
    }
}