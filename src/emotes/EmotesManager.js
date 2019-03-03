const fetch = require('node-fetch');
const CommandoConstants = require('../client/CommandoConstants');

class EmotesManager
{
    constructor(client)
    {
        this.client = client;
        this.emotes = {}
        this.emotesArray = [];
    }

    async getGlobalEmotes()
    {
        this.client.logger.info('Loading global emotes');

        var response = await fetch(CommandoConstants.GLOBAL_EMOTES_URL);
        var json = await response.json();
        this.emotes = json;

        var keys = Object.keys(this.emotes);
        for (let index = 0; index < keys.length; index++) {
            const e = this.emotes[keys[index]];
            this.emotesArray.push(e);            
        }
    }

    getRandomEmote()
    {
        let emote = this.emotesArray[Math.floor(Math.random() * this.emotesArray.length)];
        return emote;
    }
}

module.exports = EmotesManager;