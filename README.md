# Twitch Bot Commando

[![npm version](https://badge.fury.io/js/twitch-commando.svg)](https://badge.fury.io/js/twitch-commando) ![GitHub last commit](https://img.shields.io/github/last-commit/shardick/twitch-commando.svg)

This is an infrastructure module for Twitch Bot developed *stealing* ideas from discord.js Commando library.

Under the hood TwitchCommandoClient uses `tmi.js` to integrate with Twitch Chat. 

I've decided to develop this module to fill the gap with Discord Bots implementation where discord.js Commando offers a big and solid infrastructure for Bots with a great command development skeleton.

# Breaking Changes in 2.0

`TwitchChatChannel` has been renamed fixing the typo.

The V2 uses [node-sqlite](https://github.com/kriasoft/node-sqlite) and [node-sqlite3](https://github.com/TryGhost/node-sqlite3) for backward compatibility.

`npm install --save sqlite sqlite3`

the Settings Provider must be initialized as follow:

```
const sqlite3 = require('sqlite3');
const sqlite = require("sqlite");

....

client.setProvider(
  sqlite
    .open({ driver: sqlite3.Database, filename: path.join(__dirname, dbName)})
    .then((db) => new CommandoSQLiteProvider(db))
);
```

## Online documentation

Please refer to https://shardick.github.io/twitch-commando/ for complete documentation

## What Twitch Commando do for you

* Automatic commands parsing
* Automatic command parameter recognition and conversion to named variables
* Useful methods like .reply to easily reply to a user quoting him in the chat
* Commands are executed in async  (useful for API integration and external http calls)
* Automatic rate limiting control (exceeding messages will be blocked at the client)
* Channel and global preferences saving (by default on Sqlite)
* Custom command prefix per channel (broadcaster can choose it)

## How to install

`npm install --save twitch-commando`

https://www.npmjs.com/package/twitch-commando

## Basic Bot skeleton

```
const {
    TwitchCommandoClient, TwitchChatMessage, TwitchChatUser, CommandoSQLiteProvider
} = require('twitch-commando');
const sqlite3 = require('sqlite3');
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

client.on('connected', () => {    
});

client.on('join', channel => {
});

client.on('error', err => {
});

client.on('message', message => {
});

client.registerDefaultCommands();
client.registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
  sqlite
    .open({ driver: sqlite3.Database, filename: path.join(__dirname, dbName)})
    .then((db) => new CommandoSQLiteProvider(db))
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

## Rate limiting control

Twitch Chat set message limits depening on bot or client type, see https://dev.twitch.tv/docs/irc/guide/#command--message-limits for detailed informations.
Commando try to solve the problem for you, controlling and blocking messages without going over the limit.

To set proper rate limiting control, you must use the `botType` property of `ClientOptions` object when passing configuration options to `TwitchCommandoClient` constructor.

To request to increase limits for your bot, please refer here: https://discuss.dev.twitch.tv/t/have-a-chat-whisper-bot-let-us-know/10651 

## Builtin commands

* **help** : this command will send a private message to the user with all commands available
* **prefix** : this command will change the command prefix for current channel (restricted to broadcaster only)
* **join** : this command will request the bot to join the message author channel. Can be executed only in bot channel (if enabled)
* **part** : this command will request the bot to leave the message author channel. Can be executed only in bot channel (enabled with **join** command)

## Changelog
* 1.0.0 : first release
* 1.0.1 : updated readme and docs
* 1.0.2 :
    * added `EmotesManager` (download updated emotes from https://twitchemotes.com/). This object is exposed as property in `TwitchCommandoClient.emotesManager`
    * added addRandomEmote to `say` and `reply` methods to avoid same message error
    * command loading: fixed bug when .js file is not a class (like empty file)
    * TwitchChatUser : added `channel` property to build the user channel name without concatenating `#` explicitly
    * Prefix command : added check for full stop character, cannot be a valid prefix because reserved in Twitch chat for server commands
    * Log unified between tmi.js and TwitchCommando using winston
    * `CommandOptions` changes: Added `hideFromHelp`, `privmsgOnly`
    * Added rate limiting control (enabled with `enableRateLimitingControl` in configuration options)
    * Added `CommandoConstants`
    * Generated documentation published for GitHub Pages
    * `ClientOptions` changes: added `botType` and `enableRateLimitingControl`
* 1.0.3
    * Fixed bug in help command
* 1.0.4
    * Fixed bot owners only command execution
* 1.0.5
    * Fixed bot owners command bug
* 1.0.6
    * Dependencies update
* 1.0.7
    * Bugfix: error fired when trying to parse an invalid JSON setting, now logged and trapped
    * Bugfix: use of auto-joiner from tmi.js to autojoin channels instead of custom solution to avoid rate limiting on many channels
* 1.0.11
    * Fixed security bug: non broadcaster, in some situations, could change the channel prefix
    * Added `isBroadcaster` getter to `TwitchChatUser` to easily identify if the message author is a broadcaster
    * Command prefix now could be more than one letter
* 1.0.12
    * Checked prefix for invalid regex characters: ^?()[]*\
* 2.0
    * Fixed TwitchChatChannel name type
    * Changed sqlite dep to node-sqlite4 and node-sqlite3
    * Updated tmi.js to 1.8.5
    * Channel is removed from settings after being banned
    * Channel is removed from settings when the channel itself doesnt exists anymore or is suspended
    * Added `skipMembership` and `joinInterval` to `ClientOptions`
* 2.0.4
    * Removed remote emotes loading
    * Fixed SettingsProvider initialization

## Roadmap

* Better docs and examples
* ~~Custom prefix (now it's stick to **!**)~~
* Command arguments validation (type and custom validation)
* ~~Integration with database like SQLLite or Mongo to save channels preferences~~
* Automatic and timed messages
* ~~Rate limiting control~~
* Mentions parsing