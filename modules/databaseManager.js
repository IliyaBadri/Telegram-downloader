const sqlite3 = require('sqlite3');

function setupDatabase(){
    return new Promise((resolve, reject) => {
        const database = new sqlite3.Database('database.db');
        database.serialize(() => {
            database.run('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT, name TEXT)');
            resolve();
        });
        database.close((closeErr) => {
            if (closeErr) {
                console.error(`Error closing the database: ${closeErr}`);
            }
        });
    });
}

function getSQLSelectorPromise(searchQuery, searchValues){
    return new Promise((resolve, reject) => {
        const database = new sqlite3.Database('database.db');
        database.all(searchQuery, searchValues, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

            database.close((closeErr) => {
                if (closeErr) {
                    console.error(`Error closing the database: ${closeErr}`);
                }
            });
        });
    });
}

function getSQLRunnerPromise(query, runValues){
    return new Promise((resolve, reject) => {
        const database = new sqlite3.Database('database.db');
        database.run(query, runValues, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(null);
            }

            database.close((closeErr) => {
                if (closeErr) {
                    console.error(`Error closing the database: ${closeErr}`);
                }
            });
        });
    });
}

function getSQLStatementPromise(query , ...insertParams) {
    return new Promise((resolve, reject) => {
        const database = new sqlite3.Database('database.db');
        database.serialize(() => {
            const statement = database.prepare(query);
            statement.run(...insertParams, (err) => {
                statement.finalize();
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        database.close((closeErr) => {
            if (closeErr) {
                console.error(`Error closing the database: ${closeErr}`);
            }
        });
    }); 
}

module.exports = {
    setupDatabase,
    getSQLSelectorPromise,
    getSQLRunnerPromise,
    getSQLStatementPromise
}
