import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { createPoll, reset, vote, getResult, listPolls } from './routes';

describe('add', function() {
  it('name error', function() {
    // Missing name
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "", time: 1, options: "chicken \n pizza"}}
    );
    const res1 = httpMocks.createResponse();
    createPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);

    // Did not fill in anything
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add'}
    );
    const res2 = httpMocks.createResponse();
    createPoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
  })

  it('time error', function() {
    // Missing time
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", options: "chicken \n pizza"}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 400);

    // Time is 0
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 0, options: "chicken \n pizza"}}
    );
    const res1 = httpMocks.createResponse();
    createPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), "Minute needs to be a positive number");

    // Time is negative number
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: -1, options: "chicken \n pizza"}}
    );
    const res2 = httpMocks.createResponse();
    createPoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), "Minute needs to be a positive number");
  })

  it('options error', function() {
    // Missing options
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 2, options: ""}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 400);
    assert.deepStrictEqual(res._getData(), "Need to have at least 2 lines of options");

    // Only one option
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 2, options: "chicken"}}
    );
    const res1 = httpMocks.createResponse();
    createPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), "Need to have at least 2 lines of options");
  })

  it ('create', function() {
    // Successfully
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 2, options: "chicken \n pizza"}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 201);
    assert.deepStrictEqual(res._getData().poll.name, "dinner");
    assert.deepStrictEqual(res._getData().poll.options, ['chicken', 'pizza']);
    assert.ok(Math.abs(res._getData().poll.time - Date.now() - 2 * 60 *1000) < 100);

    // Name has been taken
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 2, options: "chicken \n pizza"}}
    );
    const res1 = httpMocks.createResponse();
    createPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), "The name 'dinner' is taken, create a new one")

    // Longer time
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "lunch", time: 8, options: "chicken \n pizza"}}
    );
    const res2 = httpMocks.createResponse();
    createPoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 201);
    assert.deepStrictEqual(res2._getData().poll.name, "lunch");
    assert.deepStrictEqual(res2._getData().poll.options, ['chicken', 'pizza']);
    assert.ok(Math.abs(res2._getData().poll.time - Date.now() - 8 * 60 *1000) < 100);
    
    reset();
  })
  reset();
})

describe('vote', function() {
  it('create', function() {
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "breakfast", time: 2, options: "chicken \n pizza"}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 201);
    assert.deepStrictEqual(res._getData().poll.name, "breakfast");
    assert.deepStrictEqual(res._getData().poll.options, ['chicken', 'pizza']);
  })
  
  it('vote-success', function() {
    const voteReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote',
      body: { name: 'breakfast', voterName: 'Coco', selected: 'chicken' } }
    );
    const voteRes = httpMocks.createResponse();
    vote(voteReq, voteRes);

    assert.strictEqual(voteRes._getStatusCode(), 200);
    assert.deepStrictEqual(voteRes._getData().poll.name, 'breakfast');
    assert.deepStrictEqual(voteRes._getData().poll.options, ['chicken', 'pizza']);
    assert.deepStrictEqual(voteRes._getData().poll.result, 'Coco:chicken');
  })

  it('no-choice', function() {
    const noVoterReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: {} }
    );
    const noVoterRes = httpMocks.createResponse();
    vote(noVoterReq, noVoterRes);

    assert.strictEqual(noVoterRes._getStatusCode(), 400);
    assert.strictEqual(noVoterRes._getData(), "Missing or invalid name");
  }) 

  it('no-name', function() {
    const noNameReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { selected: 'chicken'} }
    );
    const noNameRes = httpMocks.createResponse();
    vote(noNameReq, noNameRes);

    assert.strictEqual(noNameRes._getStatusCode(), 400);
    assert.strictEqual(noNameRes._getData(), "Missing or invalid name");
  })

  it('wrong-name', function() {
    const wrongNameReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { name: 'dinner', selected: 'chicken'} }
    );
    const wrongNameRes = httpMocks.createResponse();
    vote(wrongNameReq, wrongNameRes);

    assert.strictEqual(wrongNameRes._getStatusCode(), 400);
    assert.strictEqual(wrongNameRes._getData(), "No poll with the name 'dinner'");
  })

  it('no-voter', function() {
    const noVoterReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/vote', body: { name: 'breakfast', selected: 'chicken'} }
    );
    const noVoterRes = httpMocks.createResponse();
    vote(noVoterReq, noVoterRes);

    assert.strictEqual(noVoterRes._getStatusCode(), 400);
    assert.strictEqual(noVoterRes._getData(), "Missing a voter's name");
  })
  reset();
})

describe('result', function() {
  it('create poll', function() {
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner2", time: 2, options: "chicken \n pizza"}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 201);
    assert.deepStrictEqual(res._getData().poll.name, "dinner2");
    assert.deepStrictEqual(res._getData().poll.options, ['chicken', 'pizza']);
  })

  it('no poll', function() {
    const noPollReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/get-result', body: { name: 'nonexistentpoll' } }
    );
    const noPollRes = httpMocks.createResponse();
    getResult(noPollReq, noPollRes);

    assert.strictEqual(noPollRes._getStatusCode(), 400);
    assert.deepStrictEqual(noPollRes._getData(), "No poll with the name 'nonexistentpoll'");
  });

  it('get-result', function() {
    const getResultReq = httpMocks.createRequest(
      { method: 'POST', url: '/api/get-result', body: { name: 'dinner2' } }
    );
    const getResultRes = httpMocks.createResponse();
    getResult(getResultReq, getResultRes);

    assert.strictEqual(getResultRes._getStatusCode(), 200);
    assert.deepStrictEqual(getResultRes._getData(), { name: 'dinner2', result: '' });
  });
  reset();
})

describe('listPolls', function() {
  it('create polls', function() {
    const req = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner", time: 2, options: "chicken \n pizza"}}
    );
    const res = httpMocks.createResponse();
    createPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 201);
    assert.deepStrictEqual(res._getData().poll.name, "dinner");
    assert.deepStrictEqual(res._getData().poll.options, ['chicken', 'pizza']);

    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "breakfast1", time: 5, options: "chicken \n pizza"}}
    );
    const res1 = httpMocks.createResponse();
    createPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 201);
    assert.deepStrictEqual(res1._getData().poll.name, "breakfast1");
    assert.deepStrictEqual(res1._getData().poll.options, ['chicken', 'pizza']);

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/add',
       body: {name: "dinner3", time: 10, options: "chicken \n pizza"}}
    );
    const res2 = httpMocks.createResponse();
    createPoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 201);
    assert.deepStrictEqual(res2._getData().poll.name, "dinner3");
    assert.deepStrictEqual(res2._getData().poll.options, ['chicken', 'pizza']);
  })
  reset();
});
