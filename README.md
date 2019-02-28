# Twitch Bot Commando

This is an infrastructure module for Twitch Bot developed *stealing* ideas from discord.js Commando library.

Under the hood TwitchCommandoClient uses `tmi.js` to integrate with Twitch Chat. 

I've decided to develop this module to fill the gap with Discord Bots implementation where discord.js Commando offers a big and solid infrastructure for Bots with a great command development skeleton.

## What Twitch Commando do for you

* Automatic commands parsing
* Automatic command parameter recognition and conversion to named variables
* Useful methods like .reply to easily reply to a user quoting him in the chat
* Commands are executed in async  (useful for API integration and external http calls)

## How to install

`npm install --save twitch-commando`

## Basic Bot skeleton

```
const {
    TwitchCommandoClient, TwtichChatMessage, TwtichChatUser, CommandoSQLiteProvider
} = require('twitch-commando');
const sqlite = require('sqlite');
const path = require('path');

var client = new TwitchCommandoClient({
    username: 'MyFancyBot',
    oauth: 'YOUROAUTHPASSWORD',
    channels: [ '#yourawesomechannel' ],
    botOwners: [
        'dowmeister'
    ]
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

client.setProvider(
    sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new CommandoSQLiteProvider(db))
);

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

## Save channel preferences

Twitch Commando comes with built-in settings provider engine to save channel preferences. By default it's based on Sqlite with a file database.

The database is created by default with an empty settings table.

In a command, you can access the settings provider as below:

### Get channel preference by key
```
this.client.settingsProvider.get(msg.channel.name, 'key', 'default Value');
```

### Set channel preference
```
this.client.settingsProvider.set(msg.channel.name, 'key', 'new value');
```

## Builtin commands

* !help : this command will send a private message to the user with all commands available
* !prefix : this command will change the command prefix for given channel (restricted to broadcaster only)
* !join : this command will request the bot to join the message author channel. Can be executed only in bot channel (if enabled)
* !part : this command will request the bot to leave the message author channel. Can be executed only in bot channel (enabled with !join command)

## Roadmap

* Better docs and examples
* ~~Custom prefix (now it's stick to **!**)~~
* Command arguments validation
* ~~Integration with database like SQLLite or Mongo to save channels preferences~~
* Automatic and timed messages