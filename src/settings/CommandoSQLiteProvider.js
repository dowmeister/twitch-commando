const SettingsProvider = require('./SettingsPovider');
const sqlite = require('sqlite');

class CommandoSQLiteProvider extends SettingsProvider
{
    constructor(databaseConnection)
    {
        super(databaseConnection);

        this.settings = {};
    }

    async init(client)
    {
        this.client = client;

        await this.db.run('CREATE TABLE IF NOT EXISTS settings (channel TEXT PRIMARY KEY, settings TEXT)');

        await this.loadSettings();
    }

    async loadSettings()
    {
        const rows = await this.db.all('SELECT channel, settings FROM settings');

        for(const row of rows) {
			let settings;
			try {
				settings = JSON.parse(row.settings);
			} catch(err) {
                this.client.emit('warn', `SQLiteProvider couldn't parse the settings stored for guild ${row.channel}.`);
                this.client.emit('error', err);
				continue;
            }
            
            if (settings != null)
			    this.settings[row.channel] = settings;
		}
    }

    async get(channel, key, defVal)
    {
        if (this.settings[channel] != undefined)
        {
            if (this.settings[channel][key] != undefined)
                return this.settings[channel][key];
            else
                return defVal;
        }
        else
            return defVal;
    }

    async set(channel, key, value)
    {
        if (this.settings[channel] == undefined)
            this.settings[channel] = {};

        let newSetting = {};
        newSetting[key] = value;

        this.settings[channel] = {...this.settings[channel], ...newSetting};

        await this.db.run('INSERT OR REPLACE INTO settings VALUES(?, ?)', channel, JSON.stringify(this.settings[channel]));
    }

    async remove(channel, key)
    {
        if (this.settings[key] !== 'undefined')
        {
            let settings = this.settings[key];
            settings[key] = undefined;
        }
    }
}

module.exports = CommandoSQLiteProvider;