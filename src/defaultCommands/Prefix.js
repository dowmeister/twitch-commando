const TwitchChatCommand = require("../commands/TwitchChatCommand");

module.exports = class PrefixCommand extends TwitchChatCommand {
  constructor(client) {
    super(client, {
      name: "prefix",
      group: "system",
      description: "This command change the command prefix in current channel",
      modOnly: true,
      examples: ["!prefix <newprefix>"],
      args: [
        {
          name: "newprefix",
          type: String,
        },
      ],
    });
  }

  async run(msg, { newprefix }) {
    //console.log(msg.author);

    var prefix = await this.client.settingsProvider.get(
      msg.channel.name,
      "prefix"
    );

    if (newprefix == "") return msg.reply(`Current prefix is ${prefix}`);

    if (newprefix == "/") return msg.reply("Prefix cannot be /");

    if (newprefix == ".") return msg.reply("Prefix cannot be . (full stop)");

    await this.client.settingsProvider.set(
      msg.channel.name,
      "prefix",
      newprefix
    );

    return msg.reply("Prefix changed");
  }
};
