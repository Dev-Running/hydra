import {io} from "../main/config/app";

interface UserList {
  userID: string;
  socketID: string;
}

const usersOnline: UserList[] = [];

io.on("connect", socket => {
  console.log(socket.handshake.auth.userID);

  socket.on("join", async data => {
    socket.join(data.room);
  });

  socket.on("leave", data => {
    socket.leave(data.room);
    socket.leave(data.room2);
    io.in(socket.id).socketsLeave([data.room, data.room2]);
  });

  socket.on("private message", async data => {
    console.log(data);
    io.to(data.room).emit("private message", {
      id: Math.random().toString(),
      room: data.room,
      from: data.from,
      to: data.to,
      content: data.message,
      sentAt: new Date(),
    });
  });
});
