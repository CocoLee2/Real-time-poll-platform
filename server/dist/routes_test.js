"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = __importStar(require("assert"));
var httpMocks = __importStar(require("node-mocks-http"));
var routes_1 = require("./routes");
describe('routes', function () {
    it('name error', function () {
        // Separate domain for each branch:
        // Missing name
        var req2 = httpMocks.createRequest({ method: 'POST', url: '/api/create-poll', body: {} });
        var res2 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(), 'The "name" field is required and must be a string.');
        (0, routes_1.resetForTesting)();
    })

    it('time error', function() {
        // Missing time
        var req = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", options: ["chicken", "pizza"]}}
        );
        var res = httpMocks.createResponse();
        (0, routes_1.createPoll)(req, res);
        assert.strictEqual(res._getStatusCode(), 400);
        assert.deepStrictEqual(res._getData(), 'The "minutes" field is required');
    
        // Time is 0
        var req1 = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", options: ["chicken", "pizza"], minutes: 0,}}
        );
        var res1 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), 'The "minutes" field must be a positive integer.');
    
        // Time is negative number
        var req2 = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", minutes: -1, options: ["chicken", "pizza"]}}
        );
        var res2 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(), 'The "minutes" field must be a positive integer.');
        (0, routes_1.resetForTesting)();
    })
        
    it('options error', function() {
        // Missing options
        var req = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", minutes: 2}}
        );
        var res = httpMocks.createResponse();
        (0, routes_1.createPoll)(req, res);
        assert.strictEqual(res._getStatusCode(), 400);
        assert.deepStrictEqual(res._getData(), 'The "options" field is required and must be more than 1 option.');
    
        // Only one option
        var req1 = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", minutes: 2, options: "chicken"}}
        );
        var res1 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), 'The "options" field is required and must be more than 1 option.');
        (0, routes_1.resetForTesting)();
    })
        
    it ('create', function() {
        // Successfully
        var req = httpMocks.createRequest(
          {method: 'POST', url: '/api/create-poll',
           body: {name: "dinner", options: ["chicken", "pizza"], minutes: 2}}
        );
        var res = httpMocks.createResponse();
        (0, routes_1.createPoll)(req, res);
        assert.strictEqual(res._getStatusCode(), 200);
        assert.deepStrictEqual(res._getData().poll.name, "dinner");
        assert.deepStrictEqual(res._getData().poll.option, ["chicken", "pizza"]);
        assert.ok(Math.abs(res._getData().poll.endTime - Date.now() - 2 * 60 *1000) < 100);
    
        // Name has been taken
        var req1 = httpMocks.createRequest(
          {method: 'POST', url: '/api/vote',
           body: {name: "dinner", minutes: 2, options: ["chicken", "pizza"]}}
        );
        var res1 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), "A poll with the name 'dinner' already exists.")
    
        // Longer time
        var req2 = httpMocks.createRequest(
          {method: 'POST', url: '/api/vote',
           body: {name: "lunch", minutes: 8, options: ["chicken", "pizza"]}}
        );
        var res2 = httpMocks.createResponse();
        (0, routes_1.createPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 200);
        assert.deepStrictEqual(res2._getData().poll.name, "lunch");
        assert.deepStrictEqual(res2._getData().poll.option, ['chicken', 'pizza']);
        assert.ok(Math.abs(res2._getData().poll.endTime - Date.now() - 8 * 60 *1000) < 100);
        (0, routes_1.resetForTesting)();
    })
})

describe('vote', function() {
  it('create', function() {
    var req = httpMocks.createRequest(
      {method: 'POST', url: '/api/create-poll',
       body: {name: "breakfast", minutes: 2, options: ["chicken", "pizza"]}}
    );
    var res = httpMocks.createResponse();
    (0, routes_1.createPoll)(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    assert.deepStrictEqual(res._getData().poll.name, "breakfast");
    assert.deepStrictEqual(res._getData().poll.option, ['chicken', 'pizza']);
  })
  
  it('vote-success', function() {
    var voteReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote',
      body: { name: 'breakfast', voter: 'Coco', option: 'chicken' } }
    );
    var voteRes = httpMocks.createResponse();
    (0, routes_1.vote)(voteReq, voteRes);
    assert.strictEqual(voteRes._getStatusCode(), 200);
    assert.deepStrictEqual(voteRes._getData().poll.name, 'breakfast');
    assert.deepStrictEqual(voteRes._getData().poll.option, ['chicken', 'pizza']);
    assert.deepStrictEqual(voteRes._getData().poll.votes, [1, 0]);
  })

  it('no-choice', function() {
    var noVoterReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { name: 'breakfast' } }
    );
    var noVoterRes = httpMocks.createResponse();
    (0, routes_1.vote)(noVoterReq, noVoterRes);
    assert.strictEqual(noVoterRes._getStatusCode(), 400);
    assert.strictEqual(noVoterRes._getData(), 'required argument "option" was missing');
  }) 

  it('no-name', function() {
    var noNameReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { option: 'chicken'} }
    );
    var noNameRes = httpMocks.createResponse();
    (0, routes_1.vote)(noNameReq, noNameRes);
    assert.strictEqual(noNameRes._getStatusCode(), 400);
    assert.strictEqual(noNameRes._getData(), 'required argument "name" was missing');
  })

  it('wrong-name', function() {
    var wrongNameReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/get-result', query: { name: 'nice'} }
    );
    var wrongNameRes = httpMocks.createResponse();
    (0, routes_1.getResult)(wrongNameReq, wrongNameRes);
    assert.strictEqual(wrongNameRes._getStatusCode(), 404);
    assert.strictEqual(wrongNameRes._getData(), 'poll does not exist');
  })

  it('no-voter', function() {
    var noVoterReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { name: 'breakfast', option: 'chicken'} }
    );
    var noVoterRes = httpMocks.createResponse();
    (0, routes_1.vote)(noVoterReq, noVoterRes);
    assert.strictEqual(noVoterRes._getStatusCode(), 400);
    assert.strictEqual(noVoterRes._getData(), 'required argument "voter" was missing');
    (0, routes_1.resetForTesting)();
  })
})

describe('result', function() {
    it('create poll', function() {
      var req = httpMocks.createRequest(
        {method: 'GET', url: '/api/get-result',
         body: {name: "dinner2", minutes: 2, options: ["chicken", "pizza"]}}
      );
      var res = httpMocks.createResponse();
      (0, routes_1.createPoll)(req, res);
      assert.strictEqual(res._getStatusCode(), 200);
      assert.deepStrictEqual(res._getData().poll.name, "dinner2");
  
    // no poll
        var noPollReq = httpMocks.createRequest(
        { method: 'GET', url: '/api/get-result', query: { name: 'nonexistentpoll'} }
      );
      var noPollRes = httpMocks.createResponse();
      (0, routes_1.getResult)(noPollReq, noPollRes);
      assert.strictEqual(noPollRes._getStatusCode(), 404);
      assert.deepStrictEqual(noPollRes._getData(), 'poll does not exist');
  
    // get result
        var getResultReq = httpMocks.createRequest(
        { method: 'GET', url: '/api/get-result', query: { name: 'dinner2' } }
      );
      var getResultRes = httpMocks.createResponse();
      (0, routes_1.getResult)(getResultReq, getResultRes);
      assert.strictEqual(getResultRes._getStatusCode(), 200);
      assert.deepStrictEqual(getResultRes._getData().poll.name, "dinner2");
      assert.deepStrictEqual(getResultRes._getData().poll.option, ["chicken", "pizza"]);
      assert.deepStrictEqual(getResultRes._getData().poll.votes, [0, 0]);
      (0, routes_1.resetForTesting)();
    })
})

describe('listPolls', function() {
  it('list polls', function() {
    var req1 = httpMocks.createRequest(
        { method: 'GET', url: '/api/list', query: {} });
    var res1 = httpMocks.createResponse();
    (0, routes_1.listPolls)(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { polls: [] });

    var req2 = httpMocks.createRequest(
        { method: 'POST', url: '/api/create-poll', body: { name: "dinner", options: ["chicken", "pizza"], minutes: 8 } });
    var res2 = httpMocks.createResponse();
    (0, routes_1.createPoll)(req2, res2);

    var req3 = httpMocks.createRequest(
        { method: 'POST', url: '/api/create-poll', body: { name: "hi2", options: ['a'], minutes: 8 } });
    var res3 = httpMocks.createResponse();
    (0, routes_1.createPoll)(req3, res3);

    var req4 = httpMocks.createRequest(
        { method: 'GET', url: '/api/list', query: {} });
    var res4 = httpMocks.createResponse();
    (0, routes_1.listPolls)(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData().polls[0].name, "dinner");
    assert.deepStrictEqual(res4._getData().polls[0].option, ['chicken', 'pizza']);
    assert.deepStrictEqual(res4._getData().polls[0].votes, [0, 0]);
    assert.deepStrictEqual(res4._getData().polls[0].total, 0);
    var endTime4 = res4._getData().polls[0].endTime;
    assert.ok(Math.abs(endTime4 - Date.now() - 8 * 60 * 1000) < 50);
    assert.deepStrictEqual(res4._getData().polls[1].name, "hi2");
    assert.deepStrictEqual(res4._getData().polls[1].option, ['a']);
    assert.deepStrictEqual(res4._getData().polls[1].votes, [0]);
    assert.deepStrictEqual(res4._getData().polls[1].total, 0);
    var endTime5 = res4._getData().polls[1].endTime;
    assert.ok(Math.abs(endTime5 - Date.now() - 8 * 60 * 1000) < 50);
  })
});