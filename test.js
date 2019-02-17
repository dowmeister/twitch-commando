const {
    TwitchCommandoClient, TwtichChatMessage, TwtichChatUser 
} = require('./index');

const path = require('path');

var client = new TwitchCommandoClient({
    username: 'TruckyBot',
    oauth: 'h6nd4u9fhl59n3njx7462hdph2p4oz',
    channels: [ '#truckyapp' ]
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