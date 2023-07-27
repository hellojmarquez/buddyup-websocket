import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: '*',
	  },
});

const userConnections = {}; // Mapeo de ID de usuario a conexión WebSocket
const messages = []; // Almacena los mensajes y la marca de tiempo

io.on('connection', (socket) => {
  // Manejador de eventos para mensajes recibidos
  console.log('Usuario conectado:', socket.id);
  socket.on('message', (data) => {
    const { fromUserId, message } = data;
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    console.log(`Mensaje recibido del cliente (usuario ${fromUserId}):`, message,timestamp);
    io.emit('message', { user: fromUserId, message, timestamp });
  });

  // Manejador de eventos para seleccionar un destinatario
  socket.on('selectRecipient', (data) => {
    const { fromUserId, toUserId } = data;

    // Registrar la conexión del destinatario
    userConnections[fromUserId] = socket.id;
    userConnections[toUserId] = socket.id;
  });

  // Limpieza: desconectar cuando el usuario se vaya
  socket.on('disconnect', () => {
    // Remover el registro de conexión del usuario desconectado
    const disconnectedUserId = Object.keys(userConnections).find(
      (userId) => userConnections[userId] === socket.id
    );
    if (disconnectedUserId) {
      delete userConnections[disconnectedUserId];
    }
    console.log('Usuario desconectado:', socket.id);
  });
});

const port = 5173; // Cambia el número de puerto si es necesario
server.listen(port, () => {
  console.log(`Servidor WebSocket escuchando en http://localhost:${port}`);
});
