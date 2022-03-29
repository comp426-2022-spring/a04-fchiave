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