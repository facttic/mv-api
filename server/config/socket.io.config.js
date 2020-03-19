const socketIo = require('socket.io');

let io;

class SocketIoConfig {
  static init(httpServer) {
    console.log('Socket IO started');
    io = socketIo(httpServer, { serveClient: false });
    io.on('connection', (_socket) => {
      console.log('Client connected');
    });
    return io;
  }

  static get() {
    return io;
  }
}

module.exports = { SocketIoConfig };
