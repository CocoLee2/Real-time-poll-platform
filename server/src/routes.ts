import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

type Poll = {
  name: string,
  time: number,
  options: string[],
  result: String
};

const polls: Map<string, Poll> = new Map();

/**
 * Clear all the existing polls, reset the system to initial status
 */
export const reset = (): void => {
  polls.clear();
}

/**
 * Create a new poll with name, time, and options
 * @param req - The request object containing poll details
 * @param res - The response object used t osend the result back to the client
 * @returns - void
 */
export const createPoll = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  const minutes = req.body.time;
  const option = req.body.options;

  if (typeof name !== 'string' || name.length < 1) {
    res.status(400).send("Missing the 'name' of the poll")
    return;
  }
  
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) {
    res.status(400).send("Minute needs to be a positive number")
    return;
  }

  if (polls.has(name)) {
    res.status(400).send(`The name '${name}' is taken, create a new one`);
    return;
  }

  if (typeof option !== 'string') {
    res.status(400).send("Missing the 'options' of the poll");
    return;
  }

  const parsedOptions  = option.split('\n').map((oneOption:string) => oneOption.trim());
  if (parsedOptions.length < 2) {
    res.status(400).send("Need to have at least 2 lines of options")
    return;
  }

  const poll: Poll = {
    name: name.trim(),
    time: Date.now() + minutes * 60 * 1000,
    options: parsedOptions,
    result: ''
  };

  polls.set(poll.name, poll);
  res.status(201).send({ poll });
}

/** 
 * Create a new vote in a poll
 * @param req - The request obkect containing poll details and voter's selection
 * @param res - The response object to be sent back to the client
 * @returns void
 */
export const vote = (req: SafeRequest, res: SafeResponse): void => {
  const input = req.body.name;
  const now = Date.now();
  const selected = req.body.selected;
  const voterName = req.body.voterName;

  if (typeof input !== 'string') {
    res.status(400).send("Missing or invalid name");
    return;
  }

  const poll = polls.get(input);
  if (!poll) {
    res.status(400).send(`No poll with the name '${input}'`);
    return;
  }

  if (now >= poll.time) {
    res.status(400).send(`'${input}' stopped taking votes`);
    return;
  }

  if (typeof selected !== 'string') {
    res.status(400).send("Missing or invalid select");
    return;
  }

  if (!voterName) {
    res.status(400).send("Missing a voter's name");
    return;
  }

  const validOptions = poll.options.map(option => option.toLowerCase());
  if (!validOptions.includes(selected.toLowerCase())) {
    res.status(400).send(`Invalid selected option '${selected}'`);
    return;
  }

  const updatedPoll = {
    name: poll.name,
    time: poll.time,
    options: poll.options,
    result: poll.result ? `${poll.result},${voterName},${selected}` : `${voterName}:${selected}`,
  };

  // Update the polls map with the new poll object
  polls.set(input, updatedPoll);
  res.status(200).send({ poll: updatedPoll });
}

/**
 * Get the result of a spercific poll
 * @param req - The request object containing the poll name
 * @param res - The response object to be sent back to the client
 * @returns void
 */
export const getResult = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;

  if (typeof name !== 'string' || name.length < 1) {
    res.status(400).send("Missing the 'name' of the poll")
    return;
  }

  const poll = polls.get(name);
  if (poll === undefined) {
    res.status(400).send(`No poll with the name '${name}'`);
    return;
  }

  const result = poll.result;
  res.status(200).send({ name, result });
}

/**
 * Compare polls for sorting
 * @param a First poll
 * @param b Second poll
 * @returns Comparison result
 */
const comparePolls = (a: Poll, b: Poll): number => {
  const now: number = Date.now();
  const endA = now <= a.time ? a.time : Number.MAX_SAFE_INTEGER - a.time;
  const endB = now <= b.time ? b.time : Number.MAX_SAFE_INTEGER - b.time;
  return endA - endB;
};

/**
 * Returns a list of all the polls, sorted so that the ongoing polls come
 * first, with the ones about to end listed first, and the completed ones after,
 * with the ones completed more recently
 * @param _req the request
 * @param res the response
 */
export const listPolls = (_req: SafeRequest, res: SafeResponse): void => {
  const sortedPolls = Array.from(polls.values()).sort(comparePolls);
  res.send({ sortedPolls });
};