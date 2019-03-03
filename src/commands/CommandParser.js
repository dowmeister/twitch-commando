class CommandParser {
  constructor(commands, client) {
    this.commands = commands;
    this.client = client;
  }

  parse(message, prefix) {
    const regex = new RegExp('^([' + prefix + '])([^\\s]+) ?(.*)','gims');

    this.client.logger.debug('%o', regex);

    //var regex = new RegExp(pattern);
    var matches = regex.exec(message);

    this.client.logger.debug('%o', matches);

    if (matches != null) {
      var prefix = matches[1];
      var command = matches[2];
      var args = [];

      if (matches.length > 3) {
        var argsString = matches[3].trim();

        args = argsString.split(" ").filter(v => v!="");
      }

      var result = {
          prefix: prefix, 
          command: command,
          args: args
      }

      return result;
    }

    return null;
  }
}

module.exports = CommandParser;
