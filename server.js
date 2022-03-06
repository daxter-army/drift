const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { addUser, getUsersInRoom, removeUser } = require("./users");

app.use(cors());

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data, cb) => {
    const user = addUser(socket.id, data.username, data.roomname);
    // console.log(getUsersInRoom(data.roomname));
    // if the username pre-exists, return error
    if (user.error) {
      console.log(user);
      cb(user);
      return;
    }

    console.log("JOINING ROOM IN SERVER");
    // If the user do not pre-exits, then admit it
    socket.join(data.roomname);

    console.log(
      `User with ID: ${user.user.id}, name: ${user.user.username}, joined room: ${user.user.roomname}`
    );

    // updating the user count in the room
    const totalUsers = getUsersInRoom(data.roomname);
    io.to(data.roomname).emit("meta_info", {
      totalActiveUsers: totalUsers.length,
    });

    // send the message to the other users
    socket.to(data.roomname).emit("receive_message", {
      uid: new Date().getMilliseconds(),
      message: `${data.username}, has joined us 🎊`,
      author: "admin",
    });
  });

  socket.on("send_message", (data) => {
    // console.log(data);
    socket.to(data.roomname).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    // info of the user who left
    const leftUser = removeUser(socket.id);

    console.log("User Disconnected", socket.id);
    // if app reloads, on the main screen
    if (leftUser === undefined) {
      return;
    }

    // updating total number of users in the room
    const totalUsers = getUsersInRoom(leftUser.roomname);
    io.to(leftUser.roomname).emit("meta_info", {
      totalActiveUsers: totalUsers.length,
    });

    // sending broadcast of person leaving the room
    socket.to(leftUser.roomname).emit("receive_message", {
      uid: new Date().getMilliseconds(),
      message: `${leftUser.username}, left the room!`,
      author: "admin",
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on #${port}`);
});
