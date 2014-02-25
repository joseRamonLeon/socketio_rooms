var http = require('http').Server;
var io = require('socket.io');
var request = require('supertest');
var expect = require('expect.js');
var Room = require('../../lib/room');
var clientFactory = require('../utilities').client;

describe('socket.io', function () {
  describe('rooms', function () {
    
    describe('default namespace', function () {
      
      // Commonly used test variables
      var sio, srv;
      
      beforeEach(function () {
        srv = http();
        sio = io(srv);
      });
    
    
      it('should be accessible through io.rooms', function () {
        srv.listen(function () {
          console.log(sio);
          expect(sio.rooms.on).to.be.a('function');
        });
      });

      it('should fire a `create` event when created', function(done){
        srv.listen(function(){
          var socket = clientFactory(srv);
          sio.rooms.on('create', function(room){
            expect(room).to.be.a(Room);
            done();
          });
        });
      });
      
      it('should fire a `destroy` event when destroyed', function(done){
        var roomId = '123';
        
        srv.listen(function(){
          var client = clientFactory(srv);
          
          // Set up rooms callback
          sio.rooms.on('create', function(room){
            // Finish when this happens
            room.on('destroy', function () {
              done();
            });
          });
          
          // Connect and disconnect a socket
          client.on('connect', function (socket) {
            // Join the room, thus creating it
            socket.join(roomId);
            
            // Leave it - last one out triggers destruction
            socket.leave(roomId);
          });
        });
      });

      it('can initiate its own messages to all its sockets', function (done) {
        var roomId = '123';
        
        srv.listen(function () {
          // Create some network clients
          var client = clientFactory(srv);
        
          // Get room to say something of its own accord
          sio.rooms.on('create', function (room) {
            room.send('ping');
          });
          
          // We are done when we receive the event
          client.on('message', function (data) {
            done();
          });
          
          // Connect a single client, listen for response          
          client.on('connect', function (socket) {
            socket.join(roomId);
          });
        });
      });

      it('should have many sockets', function(done){
        var roomId = '123';
        
        srv.listen(function () {
          // Create some network clients
          var clients = [clientFactory(srv), clientFactory(srv)];
        
          // Set up room callback
          sio.rooms.on('create', function (room) {
            room.on('join', function () {
              // Stop once all our clients have connected
              var isRightRoom = (room.id === roomId);
              var allConnected = (room.sockets.length === clients.length);
              if (isRightRoom && allConnected) {
                done();
              }
            });
          });
          
          // Then connect the clients
          clients.forEach(function (client) {          
            client.on('connect', function (socket) {
              socket.join(roomId);
            });
          });
        });
      });
    });
  });
});