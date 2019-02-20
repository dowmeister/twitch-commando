class CommandParser {
  constructor(commands) {
    this.commands = commands;
  }

  parse(message) {
    const pattern = /(!)([^\s]*) ?(.*)/gims;

    var regex = new RegExp(pattern);
    var matches = regex.exec(message);

    console.log(matches);

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
