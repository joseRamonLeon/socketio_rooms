var http = require('http').Server;
var sio = require('socket.io');
var request = require('supertest');
var expect = require('expect.js');
var sinon = require('sinon');
var Emitter = require('events').EventEmitter;
var Signal = require('signals');

/* The System Under Test */
var Room = require('../../lib/room');
    
/*
 * Room unit tests
 */
describe('room', function() {
  var sandbox;
  
  // Commonly used room dependencies
  var id, srv, owner, nsp, clientsArray, r;
    
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    
    id = '123';
    nsp = '';
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
    
    r = new Room(id, srv);
  });
  
  afterEach(function () {
    sandbox.restore();
  });
  
  it('should initialize its instance variables', function (done) { 
    // Does it store room ID
    expect(r.id).to.be(id);
    
    // Is the owner in the list of sockets
    expect(r.sockets).to.contain(owner);
    
    // Are there some signals
    expect(r.joined).to.be.a(Signal);
    expect(r.left).to.be.a(Signal);
    expect(r.destroyed).to.be.a(Signal);
    
    done();
  });
  
  it('should send messages', function (done) {
    // Mock room deps
    var eventName = 'message';
    var data = 'hello';
    
    // Stub the delegated sender function
    var namesp = srv.in(id);
    var method = sandbox.stub(namesp, 'emit');
    
    // Execute
    r.emit(eventName, data);
    
    // Stub assertions
    sinon.assert.calledOnce(method);
    sinon.assert.calledWithMatch(method, eventName, data);
    
    done();
  });
});