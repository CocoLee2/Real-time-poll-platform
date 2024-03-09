"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForTesting = exports.listPolls = exports.getResult = exports.vote = exports.createPoll = void 0;
var Polls = new Map();

/** to have the file reset to empty */
var resetForTesting = function () {
    Polls.clear();
};
exports.resetForTesting = resetForTesting;
var first = function (param) {
    if (Array.isArray(param)) {
        return first(param[0]);
    }
    else if (typeof param === 'string') {
        return param;
    }
    else {
        return undefined;
    }
};

/** return a list of current polls */
var listPolls = function (_req, res) {
    var e_1, _a;
    var fileNames = Array.from(Polls.keys());
    var pollss = [];
    try {
        for (var fileNames_1 = __values(fileNames), fileNames_1_1 = fileNames_1.next(); !fileNames_1_1.done; fileNames_1_1 = fileNames_1.next()) {
            var poll = fileNames_1_1.value;
            var po = Polls.get(poll);
            if (po !== undefined) {
                var newPoll = {
                    name: po.name,
                    option: po.option,
                    votes: po.votes,
                    total: po.total,
                    endTime: po.endTime
                };
                pollss.push(newPoll);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (fileNames_1_1 && !fileNames_1_1.done && (_a = fileNames_1.return)) _a.call(fileNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    res.send({ polls: pollss });
};
exports.listPolls = listPolls;

/** get the result of the poll with given name */
var getResult = function (req, res) {
    var _a, _b, _c, _d;
    var name = first(req.query.name);
    if (name === undefined) {
        res.status(400).send('required argument "name" was missing');
        return;
    }
    var current = Polls.get(name);
    if ((name !== undefined && current === undefined)) {
        res.status(404).send('poll does not exist');
        return;
    }
    if (current !== undefined) {
        var newPoll = { name: current === null || current === void 0 ? void 0 : current.name,
            // choice of options
            option: (_a = Polls.get(name)) === null || _a === void 0 ? void 0 : _a.option,
            votes: (_b = Polls.get(name)) === null || _b === void 0 ? void 0 : _b.votes,
            total: (_c = Polls.get(name)) === null || _c === void 0 ? void 0 : _c.total,
            // remaining time of the poll
            endTime: (_d = Polls.get(name)) === null || _d === void 0 ? void 0 : _d.endTime };
        res.send({ poll: newPoll, name: name });
    }
};
exports.getResult = getResult;

/** receive vote from client */
var vote = function (req, res) {
    var _a, _b, _c, _d, _e;
    var name = req.body.name;
    if (name === undefined || typeof name !== 'string') {
        res.status(400).send('required argument "name" was missing');
        return;
    }
    else if (Polls.get(name) === undefined) {
        res.status(400).send('poll does not exist');
        return;
    }
    var vote = req.body.option;
    var current = Polls.get(name);
    if (vote === undefined || typeof (vote) !== 'string' || (current !== undefined && current.option.indexOf(vote) < 0)) {
        res.status(400).send('required argument "option" was missing');
        return;
    }
    var voter = req.body.voter;
    if (voter === undefined || typeof voter !== 'string') {
        res.status(400).send('required argument "voter" was missing');
        return;
    }
    if (current === undefined) {
        return;
    }

    if (current.voters.get(voter) !== undefined) {
        var oldVote = current.voters.get(voter);
        if (oldVote !== undefined) {
            var i = current.option.indexOf(oldVote);
            current.votes[i] -= 1;
        }
        var j = current.option.indexOf(vote);
        current.votes[j] += 1;
    } else {
        current.total += 1;
        current.voters.set(voter, vote);
        var index = current.option.indexOf(vote);
        current.votes[index] += 1;
    }
    current.voters.set(voter, vote);
    var newPoll = {
        name: (_a = Polls.get(name)) === null || _a === void 0 ? void 0 : _a.name,
        option: (_b = Polls.get(name)) === null || _b === void 0 ? void 0 : _b.option,
        votes: (_c = Polls.get(name)) === null || _c === void 0 ? void 0 : _c.votes,
        total: (_d = Polls.get(name)) === null || _d === void 0 ? void 0 : _d.total,
        endTime: (_e = Polls.get(name)) === null || _e === void 0 ? void 0 : _e.endTime
    };
    res.send({ poll: newPoll });
};
exports.vote = vote;

/** Handles request for /save by storing the given transcript. */
var createPoll = function (req, res) {
    var _a, _b, _c, _d, _e;
    var name = req.body.name;
    if (name === undefined || typeof name !== 'string') {
        res.status(400).send('The "name" field is required and must be a string.');
        return;
    }
    var option = req.body.options;
    if (option === undefined || !Array.isArray(option) || typeof option[0] !== 'string') {
        res.status(400).send('The "options" field is required and must be more than 1 option.');
        return;
    }
    var minutes = req.body.minutes;
    if (minutes === undefined || typeof minutes !== 'number') {
        res.status(400).send('The "minutes" field is required');
        return;
    }
    else if (isNaN(minutes) || minutes < 1 || Math.round(minutes) !== minutes) {
        res.status(400).send('The "minutes" field must be a positive integer.');
        return;
    }
    if (Polls.get(name) !== undefined) {
        res.status(400).send(`A poll with the name '${name}' already exists.`);
        return;
    }
    
    var poll = {
        name: name,
        option: option,
        votes: [],
        voters: new Map(),
        endTime: Date.now() + minutes * 60 * 1000,
        total: 0,
    };
    // Inv: i < poll.option.length
    for (var i = 0; i < poll.option.length; i++) {
        poll.votes.push(0);
    }
    Polls.set(name, poll);
    var votes = [];
    var pol = (_a = Polls.get(name)) === null || _a === void 0 ? void 0 : _a.option;
    if (pol === undefined) {
        return;
    }
    // Inv: i < pol.length
    for (var i = 0; i < pol.length; i++) {
        votes.push(0);
    }
    var newPoll = {
        name: (_b = Polls.get(name)) === null || _b === void 0 ? void 0 : _b.name,
        option: (_c = Polls.get(name)) === null || _c === void 0 ? void 0 : _c.option,
        votes: votes,
        total: (_d = Polls.get(name)) === null || _d === void 0 ? void 0 : _d.total,
        endTime: (_e = Polls.get(name)) === null || _e === void 0 ? void 0 : _e.endTime
    };
    res.send({ name: name, poll: newPoll });
};
exports.createPoll = createPoll;
