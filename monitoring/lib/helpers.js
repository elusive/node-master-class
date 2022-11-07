/*
 * Helper functions for the application
 */

// deps
const crypto = require('crypto');
const config = require('./config');


// container for helpers
const helpers = {};


// create a SHA256 hash
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};


// parse json string to an object w/o error
helpers.parseJsonToObject = (json) => {
    try {
        let obj = JSON.parse(json);
        return obj;
    } catch (e) {   // exception when empty will be 'Unexpected end of JSON input'
        return {};
    }
}; 

// create a string of random alphanumeric chars, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength){
        // define all the possible chars
        var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // start final string
        var str = '';

        for (let i=1; i <= strLength; i++){
            // get random char from possibleChars
            var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

            // append char to final string
            str+=randomChar;
        }

        return str;
    }else {
        return false; 
    }
}

module.exports = helpers;
