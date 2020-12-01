const express = require("express");
const authLogic = require("../business-logic/auth-logic");
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const isAdmin = require("../middleware/is-admin");
const errorHandler = require("../helpers/error-handler");
const verifyLoggedIn = require("../middleware/verify-logged-in");

router.post("/register", async (request, response) => {
    try {
        // To prevent from same usernames registering
        const isUserExists = await authLogic.isUserExists(request.body.username);
        if (isUserExists) {
            response.status(400).send("Username already exists, Please choose another username");
            return;
        }
        else {
            const user = new User(0, request.body.firstName, request.body.lastName, request.body.username, request.body.password, 0);
            const addedUser = await authLogic.register(user);
            const token = jwt.sign({ user }, config.jwt.secretKey, { expiresIn: "30d" });
            // Save that user in the session:
            request.session.user = addedUser;
            response.status(201).json({ addedUser, token });
        }
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})

router.post("/login", async (request, response) => {
    try {
        const credentials = request.body;
        const user = await authLogic.login(credentials);
        if (!user) {
            response.status(400).send("Illegal username or password");
            return;
        }
        
        const isAdmin = await authLogic.isAdmin(user.username);
        const token = jwt.sign({ user }, config.jwt.secretKey, { expiresIn: "30d" });
        const token2 = isAdmin ? jwt.sign({ isAdmin }, config.jwt.adminSecretKey, { expiresIn: "30d" }) : "";
        request.session.user = user;
        response.json({ user, token, token2 });
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})
router.post("/isUserExists/:username", async (request, response) => {
    try {
        const username = request.params.username;
        const isUserExists = await authLogic.isUserExists(username);
        response.send(isUserExists);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})

router.post("/logout", (request, response) => {
    try {
        request.session.destroy();
        response.end();
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }

})

router.post("/is-admin", isAdmin, async (request, response) => { // Add Middleware
    try {
        response.end();
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.post("/is-logged-in", verifyLoggedIn, async (request, response) => {
    try {
        response.end();
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})
module.exports = router;