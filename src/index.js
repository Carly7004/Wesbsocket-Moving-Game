const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv");

dotenv.config();

app.use(express.static("public"));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

const GUESSED_WORD_EVENT = "guessedWord";
const GUESS_EVENT = "guess";
const JOIN_EVENT = "joined";
const CONNECTION_EVENT = "connection";

const allWOrdsToGuess = [
    "javascript",
    "python",
    "nextjs",
    "react",
    "nodejs",
    "typescript",
    "tailwind",
    "css",
    "html",
    "express",
    "fastify",
    "redux",
    "usestate",
    "idontknow",
]

const users = {};

let wordToGuess;
let guessedWord;

const setNextWord = () => {
    const word = allWOrdsToGuess[parseInt(Math.random() * allWOrdsToGuess.length)]
  wordToGuess = word;
  guessedWord = wordToGuess.split("").fill("_");
};
setNextWord("dog");
console.log(guessedWord);

const getGuessedWord = () => {
  return guessedWord.join("");
};

const emitGuessedWord = (channel) => {
  channel.emit(GUESSED_WORD_EVENT, getGuessedWord());
};

io.on(CONNECTION_EVENT, (socket) => {
  console.log("a user connected");

  emitGuessedWord(socket);

  // geting user from the frontend/index.html
  // and when user connect we keep track of their username
  socket.on(JOIN_EVENT, (username) => {
    users[socket.id] = {
      username,
    };
    console.log(users);
  });
  // checking if user letter is the same was wordToGuess, and broadcast it to all users
  socket.on(GUESS_EVENT, (letter) => {
    let isCorrectGuess = false;
    // using forEach method or for loop to check if letter is correct
    [...wordToGuess].forEach((character, i) => {
      if (character === letter) {
        guessedWord[i] = character;
        isCorrectGuess = true;
      }
    });
    // for(let i = 0; i < wordToGuess.length; i++) {
    //     const character = wordToGuess[i];
    //     if(character === letter) {
    //         placeholder[i] = letter;
    //         isCorrectGuess = true;
    //     }
    // }
    if (isCorrectGuess) {
      if (!guessedWord.includes("_")) {
        setNextWord();
      }
      emitGuessedWord(io);
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
