import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Active Rooms State Store with settings
const rooms = new Map<string, {
  hostId: string;
  guestId?: string;
  roomCode: string;
  mode: 'ONLINE' | 'LOCAL';
  hostName?: string;
  settings?: {
    gameMode: string;
    squadSize: number;
    startingCash: number;
  };
  gameState?: any;
}>();

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Broadcast available local rooms with settings
  const broadcastRooms = () => {
    const localRoomsList = Array.from(rooms.values())
      .filter(r => !r.guestId)
      .map(r => ({
        roomCode: r.roomCode,
        hostName: r.hostName || 'Host Player',
        mode: r.mode,
        settings: r.settings || { gameMode: 'Draft Mode', squadSize: 11, startingCash: 1000 }
      }));
    io.emit('local-rooms-list', localRoomsList);
    io.emit('online-rooms-list', localRoomsList);
  };

  socket.on('get-local-rooms', () => {
    broadcastRooms();
  });

  socket.on('get-online-rooms', () => {
    broadcastRooms();
  });

  // Create Local Room (Host LAN) with Settings
  socket.on('create-local-room', ({ hostName, settings }, callback) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `LAN-${randomNum}`;
    
    rooms.set(roomCode, {
      hostId: socket.id,
      roomCode,
      mode: 'LOCAL',
      hostName: hostName || 'Host Device',
      settings: settings || { gameMode: 'Draft Mode', squadSize: 11, startingCash: 1000 }
    });

    socket.join(roomCode);
    console.log(`Local LAN Room created: ${roomCode} by ${hostName || socket.id}`);
    broadcastRooms();
    
    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  // Join Local Room (Guest LAN)
  socket.on('join-local-room', ({ roomCode, guestName }, callback) => {
    const cleanCode = roomCode.trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Local room not found.' });
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
    socket.join(cleanCode);
    console.log(`Guest ${guestName || socket.id} joined local room: ${cleanCode}`);

    io.to(room.hostId).emit('opponent-joined', { guestId: socket.id, username: guestName });
    broadcastRooms();

    if (typeof callback === 'function') {
      callback({ success: true, roomCode: cleanCode, settings: room.settings });
    }
  });

  // Create Room (Host Global) with Settings
  socket.on('create-room', ({ mode = 'ONLINE', username, settings }, callback) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `X11-${randomNum}`;
    
    rooms.set(roomCode, {
      hostId: socket.id,
      roomCode,
      mode: 'ONLINE',
      hostName: username || 'Host Player',
      settings: settings || { gameMode: 'Draft Mode', squadSize: 11, startingCash: 1000 }
    });

    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by ${username || socket.id}`);
    broadcastRooms();
    
    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  // Join Room (Guest Global)
  socket.on('join-room', ({ roomCode, username }, callback) => {
    const cleanCode = roomCode.trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      socket.emit('room-error', { message: 'Room not found. Check the code and try again.' });
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Room not found. Check the code and try again.' });
      }
      return;
    }

    if (room.guestId) {
      socket.emit('room-error', { message: 'Room is already full.' });
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Room is already full.' });
      }
      return;
    }

    room.guestId = socket.id;
    socket.join(cleanCode);
    console.log(`Player ${username || socket.id} joined room: ${cleanCode}`);

    io.to(room.hostId).emit('opponent-joined', { guestId: socket.id, username });
    io.to(cleanCode).emit('player-joined', { guestId: socket.id, username, roomCode: cleanCode });
    io.to(cleanCode).emit('start-game', { roomCode: cleanCode, settings: room.settings });
    broadcastRooms();

    if (typeof callback === 'function') {
      callback({ success: true, roomCode: cleanCode, settings: room.settings });
    }
  });

  // Random Opponent Matchmaking for Dream Squad
  socket.on('find-random-match', ({ username, squadOvr }, callback) => {
    console.log(`Player ${username} (OVR: ${squadOvr}) searching for random opponent...`);
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
    }, 1500);
  });

  // Authoritative Auction State Synchronization
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

  // Real-time Game State Synchronization
  socket.on('sync-game-action', ({ roomCode, actionType, payload }) => {
    socket.to(roomCode).emit('receive-game-action', { actionType, payload, senderId: socket.id });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    for (const [roomCode, room] of rooms.entries()) {
      if (room.hostId === socket.id || room.guestId === socket.id) {
        io.to(roomCode).emit('opponent-disconnected', { disconnectedId: socket.id });
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} closed due to disconnection.`);
        break;
      }
    }
    broadcastRooms();
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
  console.log(`X11 Multiplayer Server running on port ${PORT}`);
});
