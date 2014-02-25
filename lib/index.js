
/**
 * Module dependencies.
 */
var Room = require("./room");
var Signal = require('signals');

/**
 * Module exports.
 */
module.exports = exports = Manager;

/**
 * Manager constructor.
 *
 * @param {socket.io.Server} socket.io server
 * @param {Object} options
 * @api public
 */
function Manager() {  
  /*
   * Triggered whenever a new Room is created.
   * @api public
   */  
  this.created = new Signal();
  
  /*
   * Now Rooms are a full-fledged class
   * containing their own lists of socket IDs
   * we need an array of Room instances.
   *
   * For ease of internal use and performance,
   * the store looks like
   * { 'roomId': [Room], 'roomId2', [Room] ... }
   *
   * @api private
   */
  this.store = {};
}

/**
 * Binds a Manager to a socket.io server.
 *
 * @param {socket.io.Server} socket.io server
 * @param {Object} options
 * @api public
 */
Manager.prototype.attach = function (srv, opts) {
  this.io = srv;

};

/**
 * Called internally whenever a sockets joins a room.
 * @api private
 */
Manager.prototype.onjoin = function (socket, roomId) {
  var room = this.store[roomId];
  
  if (room) {
    debug('socket joining existing room with id %s', roomId);
    room.joined.dispatch(socket);
    
  } else {
    debug('new room with id %s', roomId);
    var r = new Room(roomId, this.io);
    this.store[roomId] = r;
    this.created.dispatch(r);
  }
};

/**
 * Called internally whenever a sockets messages a room.
 * Handles variable amounts of data args with `arguments` splicing.
 * @api private
 */
Manager.prototype.onmessage = function (roomId, eventName, socket) {
  var room = this.store[roomId];
  
  if (room) {
    // Remove 1st element - the room ID.
    // we want everything else, preserving the exact order.
    var args = arguments.shift();
    room.messaged.emit(args);    
  }
};

/**
 * Called internally whenever a sockets leaves a room.
 * @api private
 */
Manager.prototype.onleave = function (socket, roomId) {
  var room = this.store[roomId];
  
  if (room) {
    debug('socket left existing room with id %s', roomId);
    room.left.dispatch(socket);
    
    if (room.sockets.length === 0) {
      debug('room empty with id %s', roomId);
      room.destroyed.dispatch();
      delete this.store[roomId];
    }
  }
};
