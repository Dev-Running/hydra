import {io} from "../main/config/app";

interface User {
  userID: string;
  socketID: string;
}

const usersOnline: User[] = [];

io.on("connection", socket => {
  io.to(socket.id).emit("Welcome", "Welcome to the server");
  io.to(socket.id).emit("socketID", socket.id);
  console.log("Connection");
  socket.on("userconnect", data => {
    //     console.log({data, socket: socket.id});

    const filter = usersOnline.find(user => user.userID === data.userID);

    if (filter) {
      filter.socketID = socket.id;
    } else {
      usersOnline.push({socketID: socket.id, userID: data.userID});
    }

    console.log(usersOnline);
  });
});
