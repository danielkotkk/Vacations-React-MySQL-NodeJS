const express = require("express");
const vacationsLogic = require("../business-logic/vacations-logic");
// Create the router.
const router = express.Router();
const multer = require("multer");
const upload = multer();
const verifyLoggedIn = require("../middleware/verify-logged-in");
const fs = require("fs");
const errorHandler = require("../helpers/error-handler");

// Get all products: 
router.get("/", verifyLoggedIn, async (request, response) => {
    try {
        const vacations = await vacationsLogic.getAllVacationsAsync();

        response.json(vacations);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.post("/upload-image/:imageUuidName", verifyLoggedIn, upload.single("file"), async function (request, response) {
    try {
        if (!request.files.file) {
            response.status(400).send("No file sent");
            return;
        }
        const imageUuidName = request.params.imageUuidName;
        const image = request.files.file;
        image.name = imageUuidName;

        image.mv("./uploads/" + image.name);
        response.end();
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})

router.get("/get-one-image/:imageUUID", async (request, response) => {
    try {
        const path = require("path");
        const fs = require("fs");
        const imageUUID = request.params.imageUUID;

        fs.readFile(path.join(__dirname, "../uploads/" + imageUUID), (err, file) => {
            return new Promise((resolve, reject) => {
                if (err)
                    reject(err);
                resolve(file);
            });
        })
        response.sendFile(path.join(__dirname, "../uploads/" + imageUUID));
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
})
router.get("/getFollowedVacations/:username", verifyLoggedIn, async (request, response) => { // FIX !!!!
    try {
        const username = request.params.username;
        const vacations = await vacationsLogic.getFollowedVacations(username);
        response.json(vacations);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.get("/numOfFollowers", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const numOfFollowers = await vacationsLogic.getNumberOfFollowers();
        response.json(numOfFollowers);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});

router.post("/addFollower", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const addedFollower = await vacationsLogic.addFollower(request.body);
        request.app.io.emit("updateFollowers", await vacationsLogic.getNumberOfFollowers());
        response.json(addedFollower);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.delete("/removeFollow/:vacationId/:username", verifyLoggedIn, async (request, response) => {
    try {
        await vacationsLogic.removeFollow(request.params.vacationId, request.params.username);
        request.app.io.emit("updateFollowers", await vacationsLogic.getNumberOfFollowers());
        response.sendStatus(204);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.post("/addVacation", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const vacationToAdd = await vacationsLogic.addVacation(request.body);
        request.app.io.emit("updateVacations", await vacationsLogic.getAllVacationsAsync());
        response.json(vacationToAdd);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.patch("/updateVacation", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const updatedVacation = await vacationsLogic.updateVacation(request.body);
        request.app.io.emit("updateVacations", await vacationsLogic.getAllVacationsAsync());
        response.json(updatedVacation);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.delete("/delete-image/:imageUuidToDelete", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const imageUuidToDelete = request.params.imageUuidToDelete;
        fs.unlink("./uploads/" + imageUuidToDelete, (err) => {
            if (err) {
                response.status(500).send(errorHandler.getError(err));
                return;
            }
        });
        response.sendStatus(204);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});
router.delete("/deleteVacation/:id/:pictureUUID", verifyLoggedIn, async (request, response) => { // Add Middleware
    try {
        const pictureUUID = request.params.pictureUUID;
        fs.unlink("./uploads/" + pictureUUID, (err) => {
            if (err) {
                response.status(500).send(errorHandler.getError(err));
                return;
            }
        });
        await vacationsLogic.deleteVacation(+request.params.id);
        request.app.io.emit("updateVacations", await vacationsLogic.getAllVacationsAsync());
        response.sendStatus(204);
    }
    catch (err) {
        response.status(500).send(errorHandler.getError(err));
    }
});


module.exports = router;