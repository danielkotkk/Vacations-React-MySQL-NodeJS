const dal = require("../data-access-layer/dal");
const hash = require("../helpers/hash");

async function register(user) {
    user.password = hash(user.password);
    const sql = `INSERT INTO Users VALUES(
        DEFAULT,
        '${user.firstName}',
        '${user.lastName}',
        '${user.username}',
        '${user.password}',
        DEFAULT)`;
    const info = await dal.executeAsync(sql);
    user.userId = info.insertId;
    return user;
}
async function login(credentials) {
    // Ignore quotes
    credentials.username = credentials.username.split("'").join("''");
    credentials.password = credentials.password.split("'").join("''");
    credentials.password = hash(credentials.password);
    const sql = `SELECT * FROM Users
                WHERE username = '${credentials.username}'
                AND password = '${credentials.password}'`;
    const users = await dal.executeAsync(sql);
    const user = users[0];
    return user;
}
async function isUserExists(username) {
    const sql = `SELECT username FROM users WHERE username = '${username}'`;
    const user = await dal.executeAsync(sql);
    return user[0] ? true : false; // If the user exists return true and if not return false.
}

async function isAdmin(username) {
    const sql = `SELECT isAdmin FROM users WHERE username = '${username}'`;
    const user = await dal.executeAsync(sql);
    return user[0].isAdmin === 1;
}
module.exports = {
    login,
    register,
    isUserExists,
    isAdmin
}