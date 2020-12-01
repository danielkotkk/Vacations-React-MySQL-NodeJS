class User {
    constructor(userId, firstName, lastName, username, password, isAdmin) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
    }
}

module.exports = User;

