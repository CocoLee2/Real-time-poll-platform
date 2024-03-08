import express, { Express } from "express";
import { createPoll, vote, listPolls, getResult } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/list", listPolls);
app.post("/api/create-poll", createPoll);
app.post("/api/vote", vote);
app.post("/api/get-result", getResult);


app.listen(port, () => console.log(`Server listening on ${port}`));
