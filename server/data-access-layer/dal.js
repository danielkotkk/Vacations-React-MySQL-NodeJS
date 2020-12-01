// Accessing the database.

const mysql = require("mysql");

// Creating a connection:
const connection = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

console.log(`We're Connected to ${config.mysql.database} Database on MySQL.`);

// Execute sql:
function executeAsync(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

module.exports = {
    executeAsync
};