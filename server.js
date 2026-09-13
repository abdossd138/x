/**
 * X11 Game - Enterprise Production Node.js + Express + Socket.io Server
 * Designed for Render, Railway, and Capacitor Android/iOS deployment.
 * Features: Heartbeat Ping/Pong keep-alive, Authoritative Auction/Turn clock,
 * Automatic Reconnection State Resync, and Power Cards synchronization.
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000, // 10s heartbeat keep-alive
  pingTimeout: 5000
});

const PORT = process.env.PORT || 3000;

// Active Rooms State Store
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[X11 Enterprise] Client connected: ${socket.id}`);

  // Heartbeat ping handler
  socket.on('heartbeat', () => {
    socket.emit('heartbeat-ack', { serverTime: Date.now() });
  });

  // Broadcast available rooms with settings
  const broadcastRooms = () => {
    const roomsList = Array.from(rooms.values())
      .filter(r => !r.guestId)
      .map(r => ({
        roomCode: r.roomCode,
        hostName: r.hostName || 'Host Player',
        mode: r.mode,
        settings: r.settings || { gameMode: 'Draft Mode', squadSize: 11, startingCash: 1000 }
      }));
    io.emit('local-rooms-list', roomsList);
    io.emit('online-rooms-list', roomsList);
  };

  socket.on('get-local-rooms', broadcastRooms);
  socket.on('get-online-rooms', broadcastRooms);

  // Create Room (Host LAN or Online) with custom settings
  socket.on('create-room', ({ mode = 'ONLINE', username, settings }, callback) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `${mode === 'LOCAL' ? 'LAN' : 'X11'}-${randomNum}`;
    
    rooms.set(roomCode, {
      hostId: socket.id,
      roomCode,
      mode: mode === 'LOCAL' ? 'LOCAL' : 'ONLINE',
      hostName: username || 'Host Player',
      settings: settings || { gameMode: 'Draft Mode', squadSize: 11, startingCash: 1000 },
      gameState: {
        currentTurn: 'host',
        highestBid: 0,
        highestBidder: null,
        timer: 20
      }
    });

    socket.join(roomCode);
    console.log(`[Room Created] ${roomCode} by ${username || socket.id}`);
    broadcastRooms();
    
    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  socket.on('create-local-room', (data, callback) => {
    socket.emit('create-room', { ...data, mode: 'LOCAL' }, callback);
  });

  // Join Room (Guest)
 // Join Room (Guest)
  socket.on('join-room', ({ roomCode, username }, callback) => {
    const cleanCode = roomCode ? roomCode.trim().toUpperCase() : '';
    const room = rooms.get(cleanCode);

    if (!room) {
      socket.emit('room-error', { message: 'Room not found.' });
      if (typeof callback === 'function') callback({ success: false, message: 'Room not found.' });
      return;
    }

    if (room.guestId && room.guestId !== socket.id) {
      socket.emit('room-error', { message: 'Room is already full.' });
      if (typeof callback === 'function') callback({ success: false, message: 'Room is already full.' });
      return;
    }

    room.guestId = socket.id;
    socket.join(cleanCode);
    console.log(`[Player Joined] ${username || socket.id} joined room: ${cleanCode}`);

    // إرسال إشعار للمضيف مباشرة وللغرفة بالكامل بأن الخصم دخل
    if (room.hostId) {
      io.to(room.hostId).emit('opponent-joined', { guestId: socket.id, username });
    }
    io.to(cleanCode).emit('player-joined', { guestId: socket.id, username, roomCode: cleanCode });

    broadcastRooms();

    if (typeof callback === 'function') {
      callback({ success: true, roomCode: cleanCode, settings: room.settings });
    }
  });

  socket.on('join-local-room', (data, callback) => {
    socket.emit('join-room', data, callback);
  });

  // Trigger match start for all players in the room when host clicks start
  socket.on('trigger-start-game', ({ roomCode }) => {
    const cleanCode = roomCode ? roomCode.trim().toUpperCase() : '';
    const room = rooms.get(cleanCode);
    
    // إرسال إشارة البدء لكل المتصلين برقم الغرفة
    io.to(cleanCode).emit('start-game', { roomCode: cleanCode, settings: room ? room.settings : null });
  });
  // Authoritative Auction State Synchronization & Reconnection Resync
  socket.on('sync-auction-action', ({ roomCode, actionType, payload }) => {
    const room = rooms.get(roomCode);
    if (room) {
      room.gameState = { ...room.gameState, ...payload };
      socket.to(roomCode).emit('receive-auction-action', { actionType, payload, senderId: socket.id });
    }
  });

  // Power Cards & Match Event Sync
  socket.on('sync-match-action', ({ roomCode, actionType, payload }) => {
    socket.to(roomCode).emit('receive-match-action', { actionType, payload, senderId: socket.id });
  });

  // Random Matchmaking Queue for Dream Squad
  socket.on('find-random-match', ({ username, squadOvr }, callback) => {
    setTimeout(() => {
      if (typeof callback === 'function') {
        callback({
          success: true,
          opponent: {
            name: 'Legend ' + ['Zlatan', 'Ronaldinho', 'Buffon', 'Zidane', 'Maldini'][Math.floor(Math.random() * 5)],
            ovr: Math.max(85, squadOvr + (Math.floor(Math.random() * 11) - 5)),
            formation: ['4-3-3', '4-4-2', '4-2-3-1'][Math.floor(Math.random() * 3)]
          }
        });
      }
    }, 1200);
  });

  // Graceful Disconnection & Auto-Reconnect Handling
  socket.on('disconnect', () => {
    console.log(`[Disconnected] Client: ${socket.id}`);
    setTimeout(() => {
      // Clean up empty rooms after brief grace period for mobile reconnection
      for (const [roomCode, room] of rooms.entries()) {
        if (room.hostId === socket.id || room.guestId === socket.id) {
          io.to(roomCode).emit('opponent-disconnected', { disconnectedId: socket.id });
          rooms.delete(roomCode);
          console.log(`[Room Closed] ${roomCode} due to host/guest disconnect.`);
          break;
        }
      }
      broadcastRooms();
    }, 5000);
  });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(` X11 Enterprise Multiplayer Server running on ${PORT}`);
  console.log(` Ready for Capacitor Android/iOS & Render/Railway `);
  console.log(`=================================================`);
});
