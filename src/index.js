const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv");
const randomname = require("random-name");

dotenv.config();

app.use(express.static("public"));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });


const CONNECTION_EVENT = "connection";

let players = [];

io.on(CONNECTION_EVENT, (socket) => {
  const player = {
    x: 0,
    y: 0,
    id: socket.id,
    name: randomname.first()
  };
  players.push(player);

  socket.on("right", () => {
    player.x += 1;
  });
  socket.on("left", () => {
    player.x -= 1;
  });
  socket.on("up", () => {
    player.y -= 1;
  });
  socket.on("down", () => {
    player.y += 1;
  });

  socket.on("disconnect", () => {
    players = players.filter((player) => player.id !== socket.id);
    io.emit("playerDisconnected", socket.id);
  })

  console.log("a user connected");
});
// every new milisec broadcaste the current state of the board
setInterval(() => {
  io.emit("players", players);
}, 1000 / 30);

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
