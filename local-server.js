/**
 * X11 Game - Lightweight Local Network (LAN / Wi-Fi) Discovery & P2P Game Server
 * Run locally without internet connection: node local-server.js
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Active Local LAN Rooms Store
const localRooms = new Map();

io.on('connection', (socket) => {
  console.log(`[LAN P2P] Device connected: ${socket.id}`);

  // Broadcast available rooms to all connected clients
  const broadcastRoomList = () => {
    const roomList = Array.from(localRooms.values()).map(r => ({
      roomCode: r.roomCode,
      hostName: r.hostName,
      createdAt: r.createdAt
    }));
    io.emit('local-rooms-list', roomList);
  };

  // Get local rooms request
  socket.on('get-local-rooms', () => {
    broadcastRoomList();
  });

  // Create Local Room (Host)
  socket.on('create-local-room', ({ hostName }, callback) => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `LAN-${randomCode}`;
    
    localRooms.set(roomCode, {
      hostId: socket.id,
      hostName: hostName || 'Host Device',
      roomCode,
      createdAt: Date.now(),
      guestId: null
    });

    socket.join(roomCode);
    console.log(`[LAN P2P] Room created: ${roomCode} by ${hostName || socket.id}`);
    
    broadcastRoomList();

    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  // Join Local Room (Guest)
  socket.on('join-local-room', ({ roomCode, guestName }, callback) => {
    const room = localRooms.get(roomCode);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Local room not found or closed.' });
      }
      return;
    }

    if (room.guestId) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Local room is already full.' });
      }
      return;
    }

    room.guestId = socket.id;
    socket.join(roomCode);
    console.log(`[LAN P2P] Guest ${guestName || socket.id} joined room: ${roomCode}`);

    // Notify host
    io.to(room.hostId).emit('opponent-joined', { guestId: socket.id, username: guestName });
    broadcastRoomList();

    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  // Real-time synchronization
  socket.on('sync-game-action', ({ roomCode, actionType, payload }) => {
    socket.to(roomCode).emit('receive-game-action', { actionType, payload, senderId: socket.id });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[LAN P2P] Device disconnected: ${socket.id}`);
    for (const [roomCode, room] of localRooms.entries()) {
      if (room.hostId === socket.id || room.guestId === socket.id) {
        io.to(roomCode).emit('opponent-disconnected', { disconnectedId: socket.id });
        localRooms.delete(roomCode);
        console.log(`[LAN P2P] Room ${roomCode} closed.`);
        break;
      }
    }
    broadcastRoomList();
  });
});

// Helper to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(` X11 Offline Local P2P Server Running!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` LAN IP:    http://${getLocalIP()}:${PORT}`);
  console.log(`========================================`);
});
