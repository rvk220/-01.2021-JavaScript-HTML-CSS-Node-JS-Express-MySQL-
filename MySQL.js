const mysql = require('mysql2');

function createConnection() {
    return new Promise((res, rej) => {
        let connection = mysql.createConnection({
            host: "127.0.0.1",
            port: "3306",
            user: "root",
            database: "universityDB",
            password: "",
            timezone: '+00:00'
        });
        connection.connect(err => {
            if (err) {
                console.log(err);
                rej({error: err, logInfo: 'невдала спроба з\'єднання з MySQL сервером'});
            }
            else {
                console.log("З'єднання з MySQL сервеом було успішно вастановлено.");
                res(connection);
            }
        });
    });
}

function query() {
    return function (...args) {
        return createConnection().then(connection => {
            return new Promise((res, rej) => {
                connection.query(...args, (err, results) => {
                    if (err) {
                        console.log(err);
                        rej({error: err, logInfo: 'хибний запит на MySQL сервер'});
                    } else {
                        res(results);
                    }
                });
            }).then(results => {
                connection.end();
                return results;
            });
        });
    }
}

module.exports.query = query(true);