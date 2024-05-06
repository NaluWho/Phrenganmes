var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var { Server } = require("socket.io");
var io = new Server(server);

/* 
  Key:  Socket Id (Int)
  Data:
        playerId: Socket Id (Int)
        playerName: Name (String)
*/ 
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);
  // create a new player and add it to our players object
  players[socket.id] = {
    playerId: socket.id,
    playerName: ""
  };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    io.emit('disconnectedUser', socket.id, players);
  });
  
  // when player submits name, update the player data
  socket.on('playerNaming', function (userName, playerId) {
    players[playerId].playerName = userName;
    socket.emit('playerNamed', playerId, players);
    socket.broadcast.emit('playerNamed', playerId, players);
  });

  socket.on('newScene', function () {
    socket.emit('newSoloTier', players);
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
