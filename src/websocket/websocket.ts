import {io} from "../main/config/app";

interface UserList {
  userID: string;
  socketID: string;
  connected: boolean;
}

const usersOnline: UserList[] = [];
io.use((socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (!userID) {
    return next(new Error("invalid userID"));
  }
  socket.userID = userID;
  socket.connected = true;
  next();
});

io.on("connection", socket => {
  // socket.broadcast.emit("user connected", {
  //   socketID: socket.id,
  //   userID: socket.userID,
  //   connected: true,
  // });

  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketID: id,
      userID: socket.userID,
      connected: true,
    });
  }

  socket.emit("users", users);

  socket.on("disconnecting", () => {
    users.forEach(user => {
      if (user.socketID === socket.id) {
        user.connected = false;
      }
    });
    socket.emit("users", users);
  });

  socket.on("join", async data => {
    // console.log(data.room);
    socket.join(data.room);
  });

  socket.on("leave", async data => {
    await socket.leave(data.room);
    const us = await io.in(data.room).fetchSockets();
    const b = await us.find(
      user => user.handshake.auth.userID === data.secondUser,
    );
    await io.socketsLeave(data.room);
    // const a = await io.sockets.fetchSockets();
    if (b) {
      await b.join(data.room);
    }
  });

  socket.on("private message", async data => {
    io.in(data.room).emit("private message", {
      id: Math.random().toString(),
      room: data.room,
      from: socket.handshake.auth.userID,
      to: data.to,
      content: data.message,
      sentAt: new Date(),
    });
  });
});
