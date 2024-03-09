"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
//import { dummy } from './routes';
var body_parser_1 = __importDefault(require("body-parser"));
var routes_1 = require("./routes");
// Configure and start the HTTP server.
var port = 8088;
var app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.get("/api/list", routes_1.listPolls);
app.get("/api/get-result", routes_1.getResult);
app.post("/api/create-poll", routes_1.createPoll);
app.post("/api/vote", routes_1.vote);
app.listen(port, function () { return console.log("Server listening on ".concat(port)); });
