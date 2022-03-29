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


// Set port to arg or default to 5000
const port = args.port || process.env.PORT || 5555

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

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

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});

// VVVV DATABASE STUFF VVVV
// Require better-sqlite.
import bettersqlite3 from 'better-sqlite3'
// Connect to a database or create one if it doesn't exist yet.
const db = new bettersqlite3('log.db');
// Is the database initialized or do we need to initialize it?
const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='logdata';`
    );
// Define row using `get()` from better-sqlite3
let row = stmt.get();
// Check if there is a table. If row is undefined then no table exists.
if (row === undefined) {
// Echo information about what you are doing to the console.
    console.log('Your database appears to be empty. I will initialize it now.');
// Set a const that will contain your SQL commands to initialize the database.
    const sqlInit = `
        CREATE TABLE logdata ( remoteaddr INTEGER PRIMARY KEY, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, secure TEXT, status TEXT, referer TEXT, useragent TEXT );
    `;
    // Execute SQL commands that we just wrote above.
    db.exec(sqlInit);
// Echo information about what we just did to the console.
    console.log('Your database has been initialized with a new table.');
} else {
// Since the database already exists, echo that to the console.
    console.log('Database exists.')
}




// to add later
`let logdata = {
    remoteaddr: request.ip,
    remoteuser: request.user,
    time: Date.now(),
    method: request.method,
    url: request.url,
    protocol: request.protocol,
    httpversion: request.httpVersion,
    secure: request.secure,
    status: result.statusCode,
    referer: request.headers['referer'],
    useragent: request.headers['user-agent']
    }`