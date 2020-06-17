const tmi = require("tmi.js");
const EventEmitter = require("events");
const readdir = require("recursive-readdir-sync");
const path = require("path");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint, simple, splat, colorize } = format;
var Queue = require('better-queue');

const TwitchChatMessage = require("../messages/TwitchChatMessage");
const TwitchChatChannel = require("../channels/TwitchChatChannel");
const TwtichChatUser = require("../users/TwitchChatUser");
const CommandParser = require("../commands/CommandParser");
const TwitchChatCommand = require("../commands/TwitchChatCommand");
const EmotesManager = require("../emotes/EmotesManager");
const CommandoConstants = require("./CommandoConstants");

/**
 * Client configuration options
 * @typedef {Object} ClientOptions
 * @property {Boolean} verboseLogging Enable verbose logging (default: false)
 * @property {String} username Bot username
 * @property {String} oauth Bot oauth password (without oauth:)
 * @property {Array<String>} botOwners List of bot owners username (default: empty array)
 * @property {String} prefix Default command prefix (default: !)
 * @property {Boolean} greetOnJoin Denotes if the bot must send a message when join a channel (default: false)
 * @property {Array<String>} channels Initials channels to join (default: empty array)
 * @property {String} onJoinMessage On Join message (sent if greetOnJoin = true)
 * @property {Boolean} autoJoinBotChannel Denotes if the bot must autojoin its own channel (default: true)
 * @property {Boolean} enableJoinCommand Denotes if enable the !join and !part command in bot channel (default: true)
 * @property {String} botType Define the bot type, will be used for message limits control. See CommandoConstants for available bot type values (default: BOT_TYPE_NORMAL)
 * @property {Boolean} enableRateLimitingControl Enable Rate Limiting control (default: true)
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
  constructor(options) {
    super();

    let defaultOptions = {
      enableVerboseLogging: false,
      channels: [],
      prefix: "!",
      greetOnJoin: false,
      onJoinMessage: '',
      botOwners: [],
      autoJoinBotChannel: true,
      enableJoinCommand: true,
      botType: CommandoConstants.BOT_TYPE_NORMAL,
      enableRateLimitingControl: true
    };

    options = Object.assign(defaultOptions, options);

    this.options = options;

    this.tmi = null;
    this.verboseLogging = this.options.enableVerboseLogging;
    this.commands = [];
    this.emotesManager = null;
    this.logger = createLogger({
      format: combine(simple(), splat(), timestamp(), colorize()),
      transports: [
        new transports.Console({
          level: this.verboseLogging ? "debug" : "info",
          colorized: true
        })
      ]
    });
    this.channelsWithMod = [];
    this.messagesCounterInterval = null;
    this.messagesCount = 0;
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
  async connect() {
    this.checkOptions();

    this.configureClient();

    this.emotesManager = new EmotesManager(this);
    await this.emotesManager.getGlobalEmotes();

    this.logger.info('Current default prefix is ' + this.options.prefix);

    this.logger.info("Connecting to Twitch Chat");

    var autoJoinChannels = this.options.channels;

    var channelsFromSettings = await this.settingsProvider.get(CommandoConstants.GLOBAL_SETTINGS_KEY, "channels", []);
    
    var channels = [...autoJoinChannels, ...channelsFromSettings];

    if (this.options.autoJoinBotChannel) {
      channels.push("#" + this.options.username);
    }

    this.logger.info('Autojoining ' + channels.length + ' channels');

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
      channels: channels,
      logger: this.logger
    });

    this.tmi.on("connected", this.onConnect.bind(this));

    this.tmi.on("disconnected", this.onDisconnect.bind(this));

    this.tmi.on("join", this.onJoin.bind(this));

    this.tmi.on("reconnect", this.onReconnect.bind(this));

    this.tmi.on("timeout", this.onTimeout.bind(this));

    this.tmi.on("mod", this.onMod.bind(this));

    this.tmi.on("unmod", this.onUnmod.bind(this));

    this.tmi.on("error", err => {
      this.logger.error(err.message);
      this.emit("error", err);
    });

    this.tmi.on("message", this.onMessage.bind(this));

    await this.tmi.connect();
  }

  /**
   * Send a text message in the channel
   *
   * @param {String} channel Channel destination
   * @param {String} message Message text
   * @param {Boolean} addRandomEmote Add random emote to avoid message duplication
   * @memberof TwitchCommandoClient
   * @async
   */
  async say(channel, message, addRandomEmote = false) {
    if (this.checkRateLimit()) {
      /*if (addRandomEmote)
        message += " " + this.emotesManager.getRandomEmote().code;*/

      var serverResponse = await this.tmi.say(channel, message);

      if (this.messagesCount == 0) this.startMessagesCounterInterval();

      this.messagesCount = this.messagesCount + 1;

      return serverResponse;
    } else this.logger.warn("Rate limit excedeed. Wait for timer reset.");
  }

  /**
   * Send an action message in the channel
   *
   * @param {String} channel
   * @param {String} message
   * @param {Boolean} addRandomEmote Add random emote to avoid message duplication
   * @returns {String}
   * @async
   * @memberof TwitchCommandoClient
   */
  async action(channel, message, addRandomEmote = false) {
    if (this.checkRateLimit()) {
      /*if (addRandomEmote)
        message += " " + this.emotesManager.getRandomEmote().code;*/

      var serverResponse = await this.tmi.action(channel, message);

      if (this.messagesCount == 0) this.startMessagesCounterInterval();

      this.messagesCount = this.messagesCount + 1;

      return serverResponse;
    } else this.logger.warn("Rate limit excedeed. Wait for timer reset.");
  }

  /**
   * Send a private message to the user with given text
   * @param {String} username
   * @param {String} message
   * @returns
   * @async
   * @memberof TwitchCommandoClient
   */
  async whisper(username, message) {
    var serverResponse = await this.tmi.whisper(username, message);
    return serverResponse;
  }

  /**
   * Register commands in given path (recursive)
   *
   * @param {String} path
   * @memberof TwitchCommandoClient
   */
  registerCommandsIn(path) {
    var files = readdir(path);

    //if (this.verboseLogging) this.logger.info(files);

    files.forEach(f => {
      var commandFile = require(f);

      if (typeof commandFile === "function") {
        var command = new commandFile(this);

        this.logger.info(
          `Register command ${command.options.group}:${command.options.name}`
        );

        //if (this.verboseLogging) this.logger.info(this.command);

        this.commands.push(command);
      }
    }, this);

    this.parser = new CommandParser(this.commands, this);
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
   * @memberof TwitchCommandoClient
   * @instance
   */
  onConnect() {
    this.emit("connected");
  }

  chunk(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

  /**
   * Channel joined or someone join the channel
   * @event TwitchCommandoClient#join
   * @type {TwitchChatChannel} channel
   * @type {String} username
   * @memberof TwitchCommandoClient
   * @instance
   */
  onJoin(channel, username) {
    var channelObject = new TwitchChatChannel(
      {
        name: channel
      },
      this
    );

    if (
      this.options.greetOnJoin &&
      this.getUsername() == username &&
      this.options.onJoinMessage &&
      this.options.onJoinMessage != ""
    ) {
      this.action(channel, this.options.onJoinMessage);
    }

    this.emit("join", channelObject, username);
  }

  /**
   * Bot disonnects
   * @event TwitchCommandoClient#disconnected
   * @type {object}
   * @memberof TwitchCommandoClient
   * @instance
   */
  onDisconnect() {
    this.emit("disconnected");
  }

  /**
   * Message received
   * @event TwitchCommandoClient#message
   * @type {TwitchChatMessage}
   * @memberof TwitchCommandoClient
   * @instance
   */

  /**
   * Command executed
   * @event TwitchCommandoClient#commandExecuted
   * @type {object}
   * @memberof TwitchCommandoClient
   * @instance
   */

  /**
   * Command error
   * @event TwitchCommandoClient#commandError
   * @type {Error}
   * @memberof TwitchCommandoClient
   * @instance
   */
  async onMessage(channel, userstate, messageText, self) {
    if (self) return;

    var message = new TwitchChatMessage(userstate, channel, this);

    if (this.verboseLogging) this.logger.info(message);

    this.emit("message", message);

    var prefix = await this.settingsProvider.get(
      message.channel.name,
      "prefix", this.options.prefix
    );

    var parserResult = this.parser.parse(messageText, prefix);

    if (parserResult != null) {
      if (this.verboseLogging) this.logger.info(parserResult);

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
        } else message.reply(preValidateResponse, true);
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
   * @memberof TwitchCommandoClient
   * @instance
   */
  onTimeout(channel, username, reason, duration) {
    this.emit("timeout", channel, username, reason, duration);
  }

  /**
   * Reconnection
   * @event TwitchCommandoClient#reconnect
   * @memberof TwitchCommandoClient
   * @instance
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
   * @param {String} channel Channel to join
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
   * @param {String} channel Channel to leave
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
  isOwner(author) {
    return this.options.botOwners.includes(author.username);
  }

  onMod(channel, username) {
    console.log("mod");

    if (
      username == this.getUsername() &&
      !this.channelsWithMod.includes(channel)
    ) {
      this.logger.debug("Bot has received mod role");
      this.channelsWithMod.push(channel);
    }

    this.emit("mod", channel, username);
  }

  onUnmod(channel, username) {
    if (username == this.getUsername()) {
      this.logger.debug("Bot has received unmod");
      this.channelsWithMod = this.channelsWithMod.filter(c => {
        return c != channel;
      });
    }
    this.emit("onumod", channel, username);
  }

  /**
   * @private
   *
   * @memberof TwitchCommandoClient
   */
  startMessagesCounterInterval() {

    if (this.options.enableRateLimitingControl)
    {
      if (this.verboseLogging)
        this.logger.debug("Starting messages counter interval");

      let messageLimits = CommandoConstants.MESSAGE_LIMITS[this.options.botType];

      this.messagesCounterInterval = setInterval(
        this.resetMessageCounter.bind(this),
        messageLimits.timespan * 1000
      );
    }
  }

  /**
   * @private
   *
   * @memberof TwitchCommandoClient
   */
  resetMessageCounter() {
    if (this.verboseLogging) this.logger.debug("Resetting messages count");

    this.messagesCount = 0;
  }

  /**
   * Check if the bot sent too many messages in timespan limit
   * @private
   *
   * @returns {Boolean}
   * @memberof TwitchCommandoClient
   */
  checkRateLimit() {

    if (this.options.enableRateLimitingControl)
    {
      let messageLimits = CommandoConstants.MESSAGE_LIMITS[this.options.botType];
      
      if (this.verboseLogging)
        this.logger.warn('Messages count: ' + this.messagesCount);
      
      if (this.messagesCount < messageLimits.messages) return true;
      else return false;
    }
    else
      return true;
  }
}

module.exports = TwitchCommandoClient;
