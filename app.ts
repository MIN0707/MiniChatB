import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import Chat from "./Chat";

interface Message {
    text: string,
    sender: string,
    timestamp: string
}

const corsOptions = {origin: '*', credentials: true};
const io = new Server(http.createServer(express()), {cors: corsOptions});
const port = 3000;

io.on('connection', (socket) => {
    socket.on('message', async (msg: Message) => {
        socket.broadcast.emit('message', {
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp
        });
        const chat = new Chat({text: msg.text, sender: msg.sender, timestamp: msg.timestamp});
        await chat.save();
    });
    socket.on('join', async (name: string, room: string) => {
        await mongoose.connect('mongodb://127.0.0.1:27017/chat' + room.trim())
            .then(async () => {
                const chat = new Chat({
                    text: name + ' has joined the chat',
                    sender: "Server",
                    timestamp: new Date().toTimeString()
                });
                await chat.save();
                const messages = await Chat.find({});
                socket.emit('messages', messages);
                socket.broadcast.emit('message', {
                    text: name + ' has joined the chat',
                    sender: "Server",
                    timestamp: new Date().toTimeString()
                });
            })
            .catch(async (error: Error) => {
                if (error.message.includes('`mongoose.connect()` multiple times.')) {
                    await mongoose.disconnect();
                    await mongoose.connect('mongodb://127.0.0.1:27017/chat' + room.trim())
                    const chat = new Chat({
                        text: name + ' has joined the chat',
                        sender: "Server",
                        timestamp: new Date().toTimeString()
                    });
                    await chat.save();
                    const msg = {
                        text: name + ' has joined the chat',
                        sender: "Server",
                        timestamp: new Date().toTimeString()
                    };
                    socket.emit('message', msg);
                    socket.broadcast.emit('message', msg);
                }
            });
    });
    socket.on('clear', async (name: string) => {
        await Chat.deleteMany({}).catch((error: Error) => console.log(error));
        const chat = new Chat({
            text: name + ' has cleared the chat',
            sender: "Server",
            timestamp: new Date().toTimeString()
        });
        await chat.save();
        socket.emit('messages', [{
            text: name + ' has cleared the chat',
            sender: "Server",
            timestamp: new Date().toTimeString()
        }]);
        socket.broadcast.emit('messages', [{
            text: name + ' has cleared the chat',
            sender: "Server",
            timestamp: new Date().toTimeString()
        }]);
    });
    socket.on('find_messages', async (find: string) => {
        const messages = await Chat.find({text: {$regex: find}});
        socket.emit('find_messages', messages);
    });
});

io.listen(port)