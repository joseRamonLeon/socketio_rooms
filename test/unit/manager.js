var http = require('http').Server;
var sio = require('socket.io');
var request = require('supertest');
var expect = require('expect.js');
var sinon = require('sinon');
var Signal = require('signals');
var Room = require('../../lib/room');


/* The System Under Test */
var Manager = require('../../lib/index');
  
/*
 * Manager unit tests
 */
describe('manager', function() {
  var sandbox;
  
  // Commonly used room dependencies
  var id, srv, owner, nsp, clientsArray, m;
    
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    
    // createStubInstance does not support __defineGetter__
    owner = { id: '345' };
    clientsArray = [owner];
    srv = {
      clients: function () {},
      in: function () {
        return {
          emit: function () {}
        };
      }
    };
    sandbox.stub(srv, "clients", function () {
      return clientsArray;
    });
    
    m = new Manager();
  });
  
  afterEach(function () {
    sandbox.restore();
  });
  
  it('should initialize its instance variables', function (done) { 
    
    // Is there a list of sockets
    expect(m.store).to.eql({});
    
    // Are there some signals
    expect(m.created).to.be.a(Signal);
    
    done();
  });
  
  
  it('should emit a join signal when onjoin called', function (done) {
    // Mock room deps
    var joinedSocket = { id: '456' };

    // Stub the 'emit' method
    var method = sandbox.stub(m.joined, 'dispatch');
        
    // Execute
    m.onjoin(joinedSocket);
    
    // Stub assertions
    sinon.assert.calledOnce(method);
    sinon.assert.calledWithMatch(method, joinedSocket);

    done();
  });
  
  it('should know of the joining socket when onjoin called', function (done) {
    // Mock room deps
    var joinedSocket = { id: '456' };
    clientsArray.push(joinedSocket);
    
    // Stub the 'emit' method
    var method = sandbox.stub(m.joined, 'dispatch');
    
    // Execute
    m.onjoin(joinedSocket);
    
    // Does it contain the new socket?
    expect(m.sockets).to.contain(joinedSocket);
    
    done();
  });
  
  it('should emit a leave signal when onleave called', function (done) {
    // Mock room deps
    var leavingSocket = { id: '456' };
    var text = 'aoeu';
        
    // Stub the 'emit' method
    var method = sandbox.stub(m.left, 'dispatch');
    
    // Execute
    m.onleave(leavingSocket, text);
    
    // Stub assertions
    sinon.assert.calledOnce(method);
    sinon.assert.calledWithMatch(method, leavingSocket, text);
    
    done();
  });
  
  

});