# Twitch Bot Commando

This is an infrastructure module for Twitch Bot developed *stealing* ideas from discord.js Commando library.

Under the hood TwitchCommandoClient uses `tmi.js` to integrate with Twitch Chat. 

I've decided to develop this module to fill the gap with Discord Bots implementation where discord.js Commando offers a big and solid infrastructure for Bots with a great command development skeleton.

By now it manages commands starting with **!** (exclamation point).

## What Twtich Commando do for you

* Automatic commands parsing
* Automatic command parameter recognition and conversion to named variables
* Useful methods like .reply to easily reply to a user quoting him in the chat
* Commands are executed in async  (useful for API integration and external http calls)

## How to install

`npm install --save twtich-commando`

**Note: Not still an npm module. Use this GitHub until npm publishing.**

## How to use

```
const {
    TwitchCommandoClient, TwtichChatMessage, TwtichChatUser 
} = require('twitch-commando');

const path = require('path');

var client = new TwitchCommandoClient({
    username: 'MyFancyBot',
    oauth: 'YOUROAUTHPASSWORD',
    channels: [ '#yourawesomechannel' ]
});

// good for development and debugging
client.enableVerboseLogging();

client.once('ready', () => {    
});

client.on('join', channel => {
});

client.on('error', err => {
});

client.on('message', message => {
});

client.registerDetaultCommands();
client.registerCommandsIn(path.join(__dirname, 'commands'));

client.connect();

```

TwitchCommandoClient extends EventEmitter so you can subscribe to its event easily.

Create a folder named `commands` divided in subfolders for each command group.

Don't forget to call `registerCommandsIn` to register your custom commands.

## Add custom commands

```

const { TwitchChatCommand } = require('../../../twitch-commando');

class SampleCommand extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'sample',
            aliases: [ 's' ],
            group: 'misc',
            description: 'Reply with a sample response'
        });
    }

    async run(msg)
    {
        msg.reply("Roger");
    }
}

module.exports = SampleCommand;

```

Send !sample or !s in your Twtich channel chat and check if works :) (it should!).

### Commands with argument

```

const { TwitchChatCommand } = require('../../../twitch-commando');

class SampleCommandWithArguments extends TwitchChatCommand
{
    constructor(client)
    {
        super(client, {
            name: 'sample',
            aliases: [ 's' ],
            group: 'misc',
            description: 'Reply with a sample response',
            args: [
                name: 'arg1',
                defaultValue: 'this is a default'
            ]
        });
    }

    async run(msg, { arg1 })
    {
        msg.reply('You sent: ' + arg1); 
    }
}

module.exports = SampleCommandWithArguments;

```

Send `!sample argumentValue`, the bot will reply with `@username You sent argumentValue` . If you send only `!sample`, default value will be used, so the bot will reply with `@username You sent this is default` .

## Builtin commands

* !help : this command will send a private message to the user with all commands available

## Roadmap

* Better docs and examples
* Custom prefix (now it's stick to **!**)
* Command arguments validation
* Integration with database like SQLLite or Mongo to save channels preferences
* Automatic and timed messages