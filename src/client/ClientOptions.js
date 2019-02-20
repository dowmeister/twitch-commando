
/**
 * Twitch Commando Client configuration options
 *
 * @class ClientOptions
 */
class ClientOptions
{ 

    /**
     * Creates an instance of ClientOptions.
     * @memberof ClientOptions
     */
    constructor() {
        /** 
         * @ignore 
         * @private 
        */
        this._verboseLogging = false;
        /** 
         * @ignore 
         * @private 
        */
        /** 
         * @ignore 
         * @private 
        */
        this._username = '';
        /** 
         * @ignore 
         * @private 
        */
        this._oauth = '';
        /** 
         * @ignore 
         * @private 
        */
        this._botOwners = [];
    }

    
    /**
     * Denotes if enable verbose logging
     *
     * @readonly
     * @memberof ClientOptions
     * @return {Boolean}
     */
    get verboseLogging()
    {
        return this._verboseLogging;
    }


    /**
     * Bot username
     *
     * @readonly
     * @memberof ClientOptions
     * @return {String}
     */
    get username()
    {
        return this._username;
    }
    

    /**
     * Oauth password
     *
     * @readonly
     * @memberof ClientOptions
     * @return {String}
     */
    get oauth()
    {
        return this._oauth;
    }


    get botOwners()
    {
        return this._botOwners;
    }
}

module.exports = ClientOptions;