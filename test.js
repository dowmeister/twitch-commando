const {
    TwitchCommandoClient
} = require('./index');

const path = require('path');

var client = new TwitchCommandoClient({
    username: 'BOTUSERNAME',
    oauth: 'YOUROAUTHPASSWORD',
    channels: [ '#yourchannel' ]
});

client.enableVerboseLogging();

client.once('ready', () => {
    
});

client.on('join', channel => {

});

client.on('error', err => {
    console.error(err);
});

client.on('message', message => {

    //message.reply('Message received');
});

client.registerDetaultCommands();
client.registerCommandsIn(path.join(__dirname, '__samplecommands__'));

client.connect();