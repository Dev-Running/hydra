import {io} from "../main/config/app";

io.use(async (socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (!userID) {
    return next(new Error("invalid userID"));
  }
  // await io.fetchSockets().then(users => {
  //   const verify = users.find(
  //     user =>
  //       user.userID === socket.handshake.auth.userID && user.id !== socket.id,
  //   );
  //   if (verify) {
  //     io.in(verify.id).disconnectSockets(true);
  //   }
  // });

  socket.userID = socket.handshake.auth.userID;
  socket.connected = true;
  next();
});

io.on("connection", socket => {
  // socket.broadcast.emit("user connected", {
  //   socketID: socket.id,
  //   userID: socket.userID,
  //   connected: true,
  // });
  // socket.join(socket.id);
  var users = [];
  // for (let [id, socket] of io.of("/").sockets) {
  //   users.push({
  //     socketID: id,
  //     userID: socket.userID,
  //     connected: true,
  //   });
  // }

  for (let [id, user] of io.of("/").sockets) {
    if (user.handshake.auth.userID === socket.userID) {
      if (id !== socket.id) {
        io.socketsLeave(id);
        io.in(id).disconnectSockets(true);
        users = users.filter(user => user.socketID !== id && user.userID);
      } else {
        users.push({
          socketID: id,
          userID: user.userID,
          connected: true,
        });
      }
    } else {
      users.push({
        socketID: id,
        userID: user.userID,
        connected: true,
      });
    }
  }

  io.emit("users", users);

  socket.on("disconnect", () => {
    const a = users.filter(user => user.socketID !== socket.id);
    socket.emit("users", a);
  });

  socket.on("join", data => {
    socket.join(data.room);
  });

  socket.on("leave", async data => {
    await socket.leave(data.room);
    const us = await io.in(data.room).fetchSockets();
    const b = us.find(user => user.handshake.auth.userID === data.secondUser);
    io.socketsLeave(data.room);
    socket.join(socket.id);
    const a = await io.sockets.fetchSockets();
    if (b) {
      b.join(data.room);
    }
  });

  socket.on("private message", async data => {
    console.log(data);

    socket.to(data.room).emit("private message", {
      id: Math.random().toString() + new Date().getMilliseconds(),
      room: data.room,
      from: socket.handshake.auth.userID,
      to: data.to,
      content: data.message,
      sentAt: new Date(),
    });
  });
});
