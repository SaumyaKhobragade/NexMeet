import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

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
            const [matchingRoom, found] = Object.entries(
                connections,
            ).reduce(
                ([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];
                },
                ["", false],
            );

            if (found) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    "data": data,
                    "sender": sender,
                    "socket-id-sender": socket.id,
                });
                console.log("Message sent to room:", matchingRoom);

                connections[matchingRoom].forEach((id) => {
                    io.to(id).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            const diffTime = Math.abs(new Date() - timeOnline[socket.id]);
            const key = null;

            for (const [roomKey, roomValue] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < roomValue.length; ++a) {
                    if (roomValue[a] === socket.id) {
                        key = roomKey;
                        for (let b = 0; b < roomValue.length; ++b) {
                            io.to(connections[roomKey][b]).emit("user-left", socket.id, diffTime);
                        }

                        const index = connections[roomKey].indexOf(socket.id);
                        connections[roomKey].splice(index, 1);

                        if (connections[roomKey].length === 0) {
                            delete connections[roomKey];
                            delete messages[roomKey];
                        }
                    }
                }
            }
        });
    });

    return io;
};
