import {User} from "@/domain/entities";
import {getRedis, setRedis} from "@/redis";
import {io} from "../main/config/app";

interface UserList {
  userID: string;
  socketID: string;
}

const usersOnline: UserList[] = [];

io.on("connection", socket => {
  io.to(socket.id).emit("Welcome", "Welcome to the server");

  socket.on("userconnect", async data => {
    const filter = usersOnline.find(user => user.userID === data.userID);
    const redis = await getRedis(data.userID);
    if (redis) {
      if (filter) {
        filter.socketID = socket.id;
      }
      await setRedis(data.userID, new User(data.userID, socket.id));
    } else {
      usersOnline.push(new User(data.userID, socket.id));
      await setRedis(data.userID, new User(data.userID, socket.id));
    }
    console.log(data);
  });

  socket.on("join", async data => {
    socket.join(data.room);
    await setRedis(data.room, {
      room: data.room,
      users: data.room.split("+"),
    });
  });

  socket.on("leave", data => {
    socket.leave(data.room);
  });

  socket.on("message", data => {
    console.log(data);

    io.to(data.room).emit("message-in-room", {
      id: Math.random().toString(),
      sentAt: new Date(),
      content: data.message,
      from: data.from,
    });
  });
});
