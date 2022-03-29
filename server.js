// Import minimist to help get command line args
import minimist from 'minimist';
const args = minimist(process.argv.slice(2))

//if --help option is included, don't init anything, return help msg and exit
if (args.help == true) {
    console.log(`server.js [options]

    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
  
    --debug	If set to \`true\`, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                \`false\`.
  
    --log		If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
  
    --help	Return this message and exit.`)
    process.exit(0);
}

// Import coin methods
// import {coinFlip, coinFlips, countFlips, flipACoin} from './modules/coin.mjs';

// Require Express.js
import express from 'express'
const app = express()
app.use(express.json());


// Require database.js
import db from './database.js';

// Set port to arg or default to 5000
const port = args.port || process.env.PORT || 5555

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

if (args.debug == 'true') {
    console.log("debug!")
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
        } catch {
           console.error(e)
        }
    });

    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.') // Express will catch this on its own.
    });
}
`
app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });

app.get('/app/flip/', (req, res) => {
    // HTTP responses, using mozilla status codes
    res.statusCode = 200;
    res.statusMessage = 'OK'
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });

    // String cleanup to get last part of path easily
    const path = req.path.substring(0, req.path.length-1)
    // Call flip module and set end with result
    res.end("{\"" + path.substring(path.lastIndexOf('/') + 1) + "\":\"" + coinFlip() + "\"}")
})

app.get('/app/flips/:number', (req, res) => {
    // param validation - check if integer
    if (!Number.isInteger(parseInt(req.params.number))) {
        // HTTP responses, using mozilla status codes
        res.statusCode = 400
        res.statusMessage = 'The server cannot process the request due to client error'
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end()
        return
    }
    // HTTP responses, using mozilla status codes
    res.statusCode = 200;
    res.statusMessage = 'OK'
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });

	const flips = coinFlips(req.params.number)
    const sumFlips = countFlips(flips)
    res.end("{\"raw\":[" + flips + "],\"summary\":{\"tails\":" + sumFlips.tails + ",\"heads\":" + sumFlips.heads + "}}")
});

app.get('/app/flip/call/:call', (req, res) => {
    // param validation
    if (req.params.call !== 'tails' && req.params.call !== 'heads') {
        // HTTP responses, using mozilla status codes
        res.statusCode = 400
        res.statusMessage = 'The server cannot process the request due to client error'
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end()
        return
    }

    // HTTP responses, using mozilla status codes
    res.statusCode = 200;
    res.statusMessage = 'OK'
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });

	const flip = flipACoin(req.params.call)
    res.end("{\"call\":\"" + flip.call + "\",\"flip\":\"" + flip.flip + "\",\"result\":\"" + flip.result + "\"}")
});
`
// middleware to insert new record into database
app.use( (req, res, next) => {
    // Your middleware goes here.
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    console.log(logdata.remoteaddr, '\n', logdata.remoteuser, '\n', logdata.time, '\n', logdata.method, '\n', logdata.url, '\n', logdata.protocol, '\n', logdata.httpversion, '\n', logdata.secure, '\n', logdata.status, '\n', logdata.referer, '\n', logdata.useragent)
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.secure, logdata.status, logdata.referer, logdata.useragent)
    res.status(200).json(info)
    next()
    })
    

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});






