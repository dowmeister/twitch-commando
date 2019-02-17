const tmi = require("tmi.js");
const EventEmitter = require("events");
const readdir = require("recursive-readdir-synchronous");
const path = require('path');

const TwitchChatMessage = require("./messages/TwitchChatMessage");
const TwitchChatChannel = require("./channels/TwitchChatChannel");
const TwtichChatUser = require('./users/TwitchChatUser');
const CommandParser = require("./commands/CommandParser");

class TwitchCommandoClient extends EventEmitter {
  constructor(options) {
    super();

    this.options = options;
    this.tmi = null;
    this.verboseLogging = false;
    this.commands = [];
  }

  enableVerboseLogging() {
    this.verboseLogging = true;
  }

  configureClient() {}

  connect() {
    this.configureClient();

    console.log("Connecting to Twitch Chat");

    this.tmi = new tmi.client({
      options: {
        debug: this.verboseLogging
      },
      connection: {
        secure: true,
        reconnect: true
      },
      identity: {
        username: this.options.username,
        password: "oauth:" + this.options.oauth
      },
      channels: this.options.channels
    });

    this.tmi.on("connected", this.onConnect.bind(this));

    this.tmi.on("disconnected", this.onDisconnect.bind(this));

    this.tmi.on("join", this.onJoin.bind(this));

    this.tmi.on("reconnect", this.onReconnect.bind(this));

    this.tmi.on("timeout", this.onTimeout.bind(this));

    this.tmi.on("error", err => {
      console.error(err.message);
      this.emit("error", err);
    });

    this.tmi.on("message", this.onMessage.bind(this));

    this.tmi.connect();
  }

  say(channel, message) {
    this.tmi.say(channel, message);
  }

  registerCommandsIn(path) {
    var files = readdir(path, [
      (file, stats) => {
        return stats.isDirectory();
      }
    ]);

    if (this.verboseLogging) console.log(files);

    files.forEach(f => {
      var commandFile = require(f);
      var command = new commandFile(this);

      console.log(
        `Register command ${command.options.group}:${command.options.name}`
      );

      if (this.verboseLogging) console.log(this.command);

      this.commands.push(command);
    }, this);

    this.parser = new CommandParser(this.commands);
  }

  findCommand(parserResult) {
    var command = null;

    this.commands.forEach(c => {
      if (parserResult.command == c.options.name) command = c;

      if (
        command == null &&
        c.options.aliases &&
        c.options.aliases.length > 0
      ) {
        if (c.options.aliases.includes(parserResult.command)) command = c;
      }
    }, this);

    return command;
  }

  onConnect() {
    this.emit("connected");
  }

  onJoin(channel) {
    var channelObject = new TwitchChatChannel(
      {
        channel: channel
      },
      this
    );

    this.emit("join", channelObject);
  }

  onDisconnect() {
    this.emit("disconnected");
  }

  onMessage(channel, userstate, messageText, self) {

    if (self) return;

    var message = new TwitchChatMessage(userstate, channel, this);

    if (this.verboseLogging) console.log(message);

    this.emit("message", message);

    var parserResult = this.parser.parse(messageText);

    if (parserResult != null)
    {
      if (this.verboseLogging) console.log(parserResult);

      var command = this.findCommand(parserResult);

      if (command != null) command.prepareRun(message, parserResult.args);
    }
  }

  onAction(action) {}

  onBan(user, reason) {}

  onUnban(user) {}

  onTimeout(channel, username, reason, duration) {
    this.emit("timeout", channel, username, reason, duration);
  }

  onReconnect() {
    this.emit("reconnect");
  }

  registerDetaultCommands()
  {
    this.registerCommandsIn(path.join(__dirname, 'defaultCommands'));
  }
}

module.exports = {
  TwitchCommandoClient, TwitchChatChannel, TwitchChatMessage, TwtichChatUser
};