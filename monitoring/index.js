/*
 * Entrypoint for API server.
 *
 */

// dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');


// server will respond to all requests with string
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// start server, listen on port 3000
httpServer.listen(config.httpPort, () => {
    console.log(config.envName + ' server is listening on port '+config.httpPort);
});


// instantiate HTTPS server and start it
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'), 
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(
    httpsServerOptions, (req, res) => unifiedServer(req, res));
httpsServer.listen(config.httpsPort, () => {
    console.log(config.envName + ' server is listening on port '+config.httpsPort);
});

var unifiedServer = (req, res) => {

    // get url and parse
    const parsedUrl = url.parse(req.url, true);

    // get the path 
    const path = parsedUrl.pathname;    
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    const queryStringObject = parsedUrl.query;

    // get HTTP method
    const method = req.method.toLowerCase();

    // get the HTTP headers as an object
    const headers = req.headers;

    // get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();     

        // choose the handler for this requests
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' 
            ? router[trimmedPath]
            : handlers.notFound;

        // construct data object to send to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method' : method,
            'headers': headers,
            'payload': buffer
        };

        // route the request to the handler
        chosenHandler(data, (statusCode, payload) => {
            // use code or a default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload or empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // convert payload to string for response
            const payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the response
            console.log('Returning the response:', statusCode, payloadString);
        });
    });
};

const handlers = {};

handlers.ping = (data, callback) => {
    callback(200);  // I am alive!
}

handlers.notFound = (data, callback) => {
    callback(404);
}

// Define a Router
const router = {
    'sample' : handlers.sample,
    'ping' : handlers.ping
};













