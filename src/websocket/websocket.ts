import {io} from "../main/config/app";

io.use((socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (!userID) {
    return next(new Error("invalid userID"));
  }
  io.fetchSockets().then(users => {
    users.forEach(user => {
      if (
        user.userID === socket.handshake.auth.userID &&
        user.socketID !== socket.id
      ) {
        user.disconnect(true);
      }
    });
  });

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
  socket.join(socket.id);
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

  let usersOnline = [];
  users.forEach(user => {
    usersOnline.push({
      userID: user.userID,
      socketID: user.socketID,
      connected: user.connected,
      self: user.socketID === socket.id,
    });
  });

  usersOnline = usersOnline.sort((a, b) => {
    if (a.self) return -1;
    if (b.self) return 1;
    if (a.userID < b.userID) return -1;
    return a.userID > b.userID ? 1 : 0;
  });
  let myUser = usersOnline.find(
    item => item.socketID === socket.id && item.userID === socket.userID,
  );
  usersOnline = usersOnline.filter(item => item.userID !== socket.userID);
  usersOnline.unshift(myUser);

  io.emit("users", users);

  socket.on("disconnect", () => {
    const a = users.filter(user => user.socketID !== socket.id);
    socket.emit("users", a);
  });

  socket.on("join", data => {
    socket.join(data.room);
  });

  socket.on("leave", data => {
    io.in(data.room)
      .fetchSockets()
      .then(res => {
        const b = res.find(
          user => user.handshake.auth.userID === data.secondUser,
        );
        io.socketsLeave(data.room);
        if (b) {
          b.join(data.room);
        }
      });
  });

  socket.on("private message", data => {
    io.fetchSockets().then(res => {
      const user = res.find(user => user.handshake.auth.userID === data.to);
      io.to(socket.id)
        .to(user.id)
        .emit("private message", {
          id: Math.random().toString() + new Date().getMilliseconds(),
          room: data.room,
          from: socket.handshake.auth.userID,
          to: data.to,
          content: data.message,
          sentAt: new Date(),
        });
    });
  });
});
