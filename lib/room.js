/**
 * Module dependencies.
 */
var util = require("util");
var Emitter = require('events').EventEmitter;
var debug = require('debug')('socket.io:room');
var Signal = require('signals');

/**
 * Room constructor.
 *
 * @param {Server} socket.io relay server instance
 * @param {String} name
 * @api private
 */
function Room(id, io, opts) {
  this.id = id;
  this.io = io;
  
  /*
   * Socket joined the room.
   * @api public
   */
  this.joined = new Signal();
  
  /*
   * Socket left the room.
   * @api public
   */
  this.left = new Signal();
  
  /*
   * Last one left the room - lights out.
   * @api public
   */
  this.destroyed = new Signal();
  
  // A participating socket got a message...
  // because the message could be any event
  // this one extends EventEmitter instead
  // of being a signal.
  this.messaged = {};
  util.inherits(this.messaged, Emitter);
  
  
  if (opts && opts.nsp) {
    this.nsp = opts.nsp;
  }
}

/**
 * Exposes room's sockets as an apparent instance variable
 * but in fact asks the main socket.io store for them.
 */
Object.defineProperty(Room.prototype, 'sockets', {
  get: function () {
    var sockets;
    
    if (this.nsp) {
      sockets = this.io.of(this.nsp).clients(this.id);
    } else {
      sockets = this.io.clients(this.id);
    }
    
    return sockets;
  }
});

/**
 * Emits reserved events to listeners,
 * broadcasts others (which are messages) to all sockets
 * in the room.
 *
 * @return {Room} self
 * @api public
 */
Room.prototype.emit = function (ev) {
  // Delegate to existing function to emit message.
  // Need to .apply with the function arguments array.
  this.io.in(this.id).emit.apply(this, arguments);
};



/**
 * Module exports.
 */
module.exports = exports = Room;
