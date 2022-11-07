/*
 *  Request handlers
 */

// deps
const { Console } = require('console');
const _data = require('./data');
const helpers = require('./helpers');

// define container for handlers
const handlers = {};


// Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for users sub methods
handlers._users = {};

// Users - POST
// required data: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data,callback) => {
    // check for required fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // ensure that this user does not already exist (by phone)
        _data.read('users', phone, (err, data) => {
            if (err) {
                // hash the text password
                let hashedPassword = helpers.hash(password);
                if (!hashedPassword) {
                    callback(500,{'Error':'Unable to create password hash.'});
                }

                // create user object
                var userObject = {
                    'firstName': firstName,
                    'lastName': lastName,
                    'phone': phone,
                    'hashedPassword': hashedPassword,
                    'tosAgreement': true
                };

                // store user
                _data.create('users',phone,userObject,(err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500,{'Error':'Could not create new user.'});
                    }
                });
            } else {
                // user already exists
                callback(400,{'Error':'A user with that phone number already exists.'});
            }
        }) 
    } else {
        callback(400,{'Error': 'Missing required fields.'});
    }
};

// Users - GET
// required data: phone
// optional data: none
handlers._users.get = (data,callback) => {
    // check phone is valid (from query string instead of payload)
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {

        // get token from header
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        
        // verify given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,(isValid) => {
            if(isValid){
                // lookup the user
                _data.read('users',phone,(err, found) => {
                    if (!err && found) {
                        // remove hashed password from returned object
                        delete found.hashedPassword;
                        callback(200, found);
                    } else {
                        callback(404);
                    }
                });
            }else{
                callback(403,{'Error':'Missing required token in header or token is invalid'});
            }
        });
    } else {
        callback(400,{'Error':'Missing required field.'});
    }
};

// Users - PUT
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data,callback) => {
     // check phone is valid 
     let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
     
     // check for optional fields
     let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
     let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
     let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
     
     // must have phone and at least one optional field to update
     if (phone) {
        // error if nothing to update
        if (firstName || lastName || password) {

            // get token from header
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
       
            // verify given token is valid for the phone number
            handlers._tokens.verifyToken(token,phone,(isValid) => {
            if(isValid){
                // lookup the user
                _data.read('users',phone,(err, found) => {
                    if (!err && found) {
                        // Update the fields necessary
                        if (firstName) {
                            found.firstName = firstName;
                        }
                        if (lastName) {
                            found.lastName = lastName;
                        }
                        if (password) {
                            found.hashedPassword = helpers.hash(password);
                        }
                        // store updated user object
                        _data.update('users',phone,found,(err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                console.log(err);
                                callback(500,{'Error':'Could not update the user.'});
                            }
                        });
                    } else {
                        callback(400,{'Error':'Specified user does not exist.'});
                    }
                });
            }else{
                callback(403,{'Error':'Missing required token in header or token is invalid'});
            });
        } else {
            callback(400,{'Error':'Missing fields to update.'});
        }
         
     } else {
         callback(400,{'Error':'Missing required field.'});
     }
};

// Users - DELETE
// required data: phone
// optional data: none
// @TODO: Cleanup (delete) any other files associated with this user (cascading...).
handlers._users.delete = (data,callback) => {
    // check phone is valid (from query string instead of payload)
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // get token from header
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
       
        // verify given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,(isValid) => {
        if(isValid){
            // lookup the user
            _data.read('users',phone,(err, found) => {
                if (!err && found) {
                    _data.delete('users',phone,(err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'Error':'Could not delete the specified user.'})
                        }
                    });
                } else {
                    callback(400, {'Error':'Could not find the specified user.'});
                }
            });
        }else{
            callback(403,{'Error':'Missing required token in header or token is invalid'});
        }
    } else {
        callback(400,{'Error':'Missing required field.'});
    }
};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);  // I am alive!
}

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Tokens
handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container
handlers._tokens = {};

// Tokens - post
// required data: phone, password
// optional data: none
handlers._tokens.post = function(data, callback){
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // lookup user who matches that phone number
        _data.read('users', phone, function(err, userData){
            if(!err && userData){
                // hash password and compare against password stored in user object
                let hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // if valid create new token wiht random name. set expiry 1 hour in future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone' : phone,
                        'id': tokenId,
                        'expires': expires
                    }

                    // store token
                    _data.create('tokens',tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'Error': 'Could not create the new token'});
                        }
                    })
                }else {
                    callback(400,{'Error': 'Password did not match specified user\'s stored password'});
                }
            }else{
                callback(400,{'Error': 'Could not find the specified user'});
            }
        })
    } else {
        callback(400,{'Error' : 'Missing required field(s)'});
    }
};

// Tokens - get
// required data: id
// optional data: none
handlers._tokens.get = function(data, callback){
     let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the token
        _data.read('tokens',id,(err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        })
    } else {
        callback(400,{'Error':'Missing required field.'});
    }
};

// Tokens - put
// required data: id, extend
// optional data: none
handlers._tokens.put = function(data, callback){
    let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend) {
        _data.read('tokens', id, (err,tokenData) => {
            if(!err && tokenData){
                if(tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens',id,tokenData,(err) => {
                        if (!err) {
                            callback(200);
                        }else {
                            callback(500,{'Error':'Could not update the token\'s expiration'});
                        }
                    })
                }else {
                    callback(400,{'Error':'The token has already expired and cannot be extended'});
                }
            }else{
                callback(400,{'Error':'Specified token does not exist'});
            }
        });
    }else {
        callback(400,{'Error': 'Missing required field(s) or field(s) are invalid'});
    }
};

// Tokens - delete
// required data: id
// optional data: none
handlers._tokens.delete = function(data, callback){
    
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the user
        _data.read('tokens',id,(err, data) => {
            if (!err && data) {
                _data.delete('tokens',id,(err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500,{'Error':'Could not delete the specified token.'})
                    }
                });
            } else {
                callback(400, {'Error':'Could not find the specified token.'});
            }
        });
    } else {
        callback(400,{'Error':'Missing required field.'});
    }
};


// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData){
            if (tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
}



module.exports = handlers;
