global.config = require(process.env.NODE_ENV === "production" ? "./config-prod" : "./config-dev");

const cors = require("cors");
const express = require("express");
const authController = require("./controllers/auth-controller");
// Create the server:
const server = express();
const session = require("express-session");
const vacationsController = require("./controllers/vacations-controller");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const socketIO = require("socket.io");
const path = require("path");
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}
const clientSideURL = process.env.NODE_ENV === "production" ? "https://daniel-vacations.herokuapp.com" : "http://localhost:3001";
server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", clientSideURL); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.use(session({
    name: "CandyShopSession", // Name of the Cookie
    secret: "CuteKittens", // Encryption key for the session id
    resave: true, // Start counting session time on each request.
    saveUninitialized: false // Don't create session automatically.
}));

// Enable parsing of JSON in the body:
server.use(express.json());
server.use(fileUpload());
server.use(cors({
    origin: clientSideURL,
    credentials: true
}));
server.use(express.static(path.join(__dirname, "./_front-end")));
server.use("/api/auth", authController);
server.use("/api/vacations", vacationsController)

server.use("*", (request, response) => {
    response.sendFile(path.join(__dirname, "./_front-end/index.html"));
});

// Start the server:

// process.env.PORT ||
const port = process.env.PORT || 3000;
const listener = server.listen(port, () => console.log(`Listening on port ${port}`));
const socketServer = socketIO(listener);
server.io = socketServer;

socketServer.sockets.on("connection", socket => {
    console.log("Client has been connected");

    socket.on("disconnect", () => {
        console.log("Client has been disconnected");
    })

})
