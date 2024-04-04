import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Chat from './Chat';
import cors from 'cors';

interface Message {
  text: string;
  sender: string;
}

const app = express();
const server = http.createServer(app);
const corsOptions = { origin: '*', credentials: true };
app.use(cors(corsOptions));

const io = new Server(server, { cors: corsOptions });
const port = 3001;

mongoose
  .connect('mongodb://127.0.0.1:27017/minichat')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: any) => console.log(error));

io.on('connection', (socket) => {
  socket.on('send', async (msg: Message) => {
    const timestamp = new Date().toTimeString();
    io.sockets.emit('receive', {
      text: msg.text,
      sender: msg.sender,
      timestamp: timestamp,
    });
    const chat = new Chat({
      text: msg.text,
      sender: msg.sender,
      timestamp: timestamp,
    });
    await chat.save();
  });
  socket.on('clear', async () => {
    await Chat.deleteMany({}).catch((error: any) => console.log(error));
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
