const tmi = require("tmi.js");
const EventEmitter = require("events");
const readdir = require("recursive-readdir-sync");
const path = require("path");

const TwitchChatMessage = require("../messages/TwitchChatMessage");
const TwitchChatChannel = require("../channels/TwitchChatChannel");
const TwtichChatUser = require("../users/TwitchChatUser");
const CommandParser = require("../commands/CommandParser");
const TwitchChatCommand = require("../commands/TwitchChatCommand");

/**
 * Client configuration options
 * @typedef {Object} ClientOptions
 * @property {Boolean} verboseLogging Enable verbose logging
 * @property {String} username Bot username
 * @property {String} oauth Bot oauth password (without oauth:)
 * @property {Array<String>} botOwners List of bot owners username
 * @property {String} prefix Default command prefix
 * @property {Boolean} greetOnJoin Denotes if the bot must send a message when join a channel
 * @property {Array<String>} channels Initials channels to join
 * @property {String} onJoinMessage On Join message (sent if greetOnJoin = true)
 * @property {Boolean} autoJoinBotChannel Denotes if the bot must autojoin its own channel
 * @property {Boolean} enableJoinCommand Denotes if enable the !join and !part command in bot channel
 */

/**
 * The Commando Client class
 * @class
 * @extends {EventEmitter}
 * @fires TwitchCommandoClient#connected
 * @fires TwitchCommandoClient#join
 * @fires TwitchCommandoClient#disconnected
 * @fires TwitchCommandoClient#timeout
 * @fires TwitchCommandoClient#error
 * @fires TwitchCommandoClient#commandExecuted
 * @fires TwitchCommandoClient#commandError
 * @fires TwitchCommandoClient#message
 * @fires TwitchCommandoClient#reconnect
 */
class TwitchCommandoClient extends EventEmitter {
  /**
   *Creates an instance of TwitchCommandoClient.
   * @param {ClientOptions} options Client configuration options
   * @memberof TwitchCommandoClient
   */
  constructor(/** @type {ClientOptions} */ options) {
    super();

    let defaultOptions = {
      prefix: "!",
      greetOnJoin: false,
      botOwners: [],
      autoJoinBotChannel: true,
      enableJoinCommand: true
    };

    options = Object.assign(defaultOptions, options);

    this.options = options;

    this.tmi = null;
    this.verboseLogging = false;
    this.commands = [];
  }

  /**
   * Enable verbose logging
   *
   * @memberof TwitchCommandoClient
   */
  enableVerboseLogging() {
    this.verboseLogging = true;
  }

  configureClient() {}

  checkOptions() {
    if (this.options.prefix == "/")
      throw new Error("Invalid prefix. Cannot be /");

    if (this.options.username == undefined)
      throw new Error("Username not specified");

    if (this.options.oauth == undefined)
      throw new Error("Oauth password not specified");
  }

  /**
   * Connect the bot to Twitch Chat
   *
   * @memberof TwitchCommandoClient
   */
  connect() {
    this.checkOptions();

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

  /**
   * Send a text message in the channel
   *
   * @param {String} channel
   * @param {String} message
   * @memberof TwitchCommandoClient
   */
  say(channel, message) {
    this.tmi.say(channel, message);
  }

  /**
   * Send an action message in the channel
   *
   * @param {String} channel
   * @param {String} message
   * @returns {String}
   * @memberof TwitchCommandoClient
   */
  action(channel, message) {
    this.tmi.action(channel, message);
  }

  /**
   * Register commands in given path (recursive)
   *
   * @param {String} path
   * @memberof TwitchCommandoClient
   */
  registerCommandsIn(path) {
    var files = readdir(path);

    //if (this.verboseLogging) console.log(files);

    files.forEach(f => {
      var commandFile = require(f);
      var command = new commandFile(this);

      console.log(
        `Register command ${command.options.group}:${command.options.name}`
      );

      //if (this.verboseLogging) console.log(this.command);

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

  /**
   * Bot connected
   * @event TwitchCommandoClient#connected
   */
  onConnect() {
    this.emit("connected");

    if (this.options.autoJoinBotChannel) {
      this.tmi.join("#" + this.options.username);
    }

    this.settingsProvider.get("global", "channels", []).then(channels => {
      channels.forEach(c => {
        if (!this.options.channels.includes(c)) {
          this.join(c);
        }
      });
    });
  }

  /**
   * Channel joined or someone join the channel
   * @event TwitchCommandoClient#join
   * @type {TwitchChatChannel} channel
   * @type {String} username
   */
  onJoin(channel, username) {
    var channelObject = new TwitchChatChannel(
      {
        name: channel
      },
      this
    );

    if (this.options.greetOnJoin && this.getUsername() == username && this.options.onJoinMessage && this.options.onJoinMessage != '') {
      this.action(channel, this.options.onJoinMessage);
    }

    this.emit("join", channelObject, username);
  }

  /**
   * Bot disonnects
   * @event TwitchCommandoClient#disconnected
   * @type {object}
   */
  onDisconnect() {
    this.emit("disconnected");
  }

  /**
   * Message received
   * @event TwitchCommandoClient#message
   * @type {TwitchChatMessage}
   */

  /**
   * Command executed
   * @event TwitchCommandoClient#commandExecuted
   * @type {object}
   */

  /**
   * Command error
   * @event TwitchCommandoClient#commandError
   * @type {Error}
   */
  async onMessage(channel, userstate, messageText, self) {
    if (self) return;

    var message = new TwitchChatMessage(userstate, channel, this);

    if (this.verboseLogging) console.log(message);

    this.emit("message", message);

    var prefix = this.options.prefix;
    var prefixFromSettngs = await this.settingsProvider.get(
      message.channel.name,
      "prefix"
    );
    if (prefixFromSettngs != undefined) prefix = prefixFromSettngs;

    var parserResult = this.parser.parse(messageText, prefix);

    if (parserResult != null) {
      if (this.verboseLogging) console.log(parserResult);

      var command = this.findCommand(parserResult);

      if (command != null) {
        let preValidateResponse = command.preValidate(message);

        if (preValidateResponse == "") {
          command
            .prepareRun(message, parserResult.args)
            .then(commandResult => {
              this.emit("commandExecuted", commandResult);
            })
            .catch(err => {
              message.reply("Unexpected error: " + err);
              this.emit("commandError", err);
            });
        } else message.reply(preValidateResponse);
      }
    }
  }

  onAction(action) {}

  onBan(user, reason) {}

  onUnban(user) {}

  /**
   * Connection timeout
   * @event TwitchCommandoClient#timeout
   * @type {object}
   */
  onTimeout(channel, username, reason, duration) {
    this.emit("timeout", channel, username, reason, duration);
  }

  /**
   * Reconnection
   * @event TwitchCommandoClient#reconnect
   */
  onReconnect() {
    this.emit("reconnect");
  }

  /**
   * Register default commands, like !help
   *
   * @memberof TwitchCommandoClient
   */
  registerDetaultCommands() {
    this.registerCommandsIn(path.join(__dirname, "../defaultCommands"));
  }

  /**
   * Set Settings Provider class
   *
   * @async
   * @memberof TwitchCommandoClient
   */
  async setProvider(provider) {
    this.settingsProvider = await provider;
    await this.settingsProvider.init(this);
  }

  /**
   * Request the bot to join a channel
   *
   * @async
   * @returns {Promise<String>}
   * @memberof TwitchCommandoClient
   */
  async join(channel) {
    return this.tmi.join(channel);
  }

   /**
   * Request the bot to leave a channel
   *
   * @async
   * @returns {Promise<String>}
   * @memberof TwitchCommandoClient
   */
  async part(channel) {
    return this.tmi.part(channel);
  }

   /**
   * Gets the bot username
   *
   * @returns {String}
   * @memberof TwitchCommandoClient
   */
  getUsername() {
    return this.tmi.getUsername();
  }

  /**
   * Gets the bot channels
   *
   * @returns {Array<String>}
   * @memberof TwitchCommandoClient
   */
  getChannels() {
    return this.tmi.getChannels();
  }

  /**
   * Checks if the message author is one of bot owners
   *
   * @param {TwitchChatUser} author Message author
   * @returns {Boolean}
   * @memberof TwitchCommandoClient
   */
  isOwner(author)
  {
    return this.options.botOwners.includes(author.username);
  }
}

module.exports = TwitchCommandoClient;
