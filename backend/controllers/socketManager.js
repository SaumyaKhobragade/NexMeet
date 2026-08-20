import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "https://nexmeet.saumyakhobragade.dev",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    const findRoomBySocketId = (socketId) => {
        for (const [roomKey, roomValue] of Object.entries(connections)) {
            if (roomValue.includes(socketId)) {
                return roomKey;
            }
        }
        return null;
    };

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join-call", (path) => {
            if (!connections[path]) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined",
                    socket.id,
                    connections[path],
                );
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][a]["data"],
                        messages[path][a]["sender"],
                        messages[path][a]["socket-id-sender"],
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const matchingRoom = findRoomBySocketId(socket.id);

            if (matchingRoom) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    "data": data,
                    "sender": sender,
                    "socket-id-sender": socket.id,
                });

                connections[matchingRoom].forEach((id) => {
                    io.to(id).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            const key = findRoomBySocketId(socket.id);

            if (key) {
                // Notify remaining users before removing
                for (let b = 0; b < connections[key].length; ++b) {
                    io.to(connections[key][b]).emit("user-left", socket.id);
                }

                const index = connections[key].indexOf(socket.id);
                connections[key].splice(index, 1);

                if (connections[key].length === 0) {
                    delete connections[key];
                    delete messages[key];
                }
            }

            // Clean up to prevent memory leak
            delete timeOnline[socket.id];
        });
    });

    return io;
};

