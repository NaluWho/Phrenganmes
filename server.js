var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var { Server } = require("socket.io");
var io = new Server(server);

/* 
  Key:  Socket Id (Int)
  Data:
        playerName: Name (String)
        lockedIn: Has Player Locked in SoloTierList (Boolean)
        soloTierList: SoloTierList Data (tierListData Object)
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
    playerName: "",
    lockedIn: false,
    soloTierList: null
  };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id], socket.id);

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

  socket.on('soloUnLockedIn', function (playerId) {
    players[playerId].lockedIn = false;
    players[playerId].soloTierList = null;
    
    var waitingOn = getUnlockedPlayers(players);
    socket.broadcast.emit('waitingOn', waitingOn, playerId);
  })
  
  socket.on('soloLockedIn', function (playerId, tierListData) {
    players[playerId].lockedIn = true;
    players[playerId].soloTierList = tierListData;
    
    var waitingOn = getUnlockedPlayers(players);

    console.log("Waiting On: ", waitingOn);
    if (waitingOn.length == 0) {
      // TODO Calculate combined tierlist
      console.log("No one waiting");
    }
    socket.emit('waitingOn', waitingOn, playerId);
    socket.broadcast.emit('waitingOn', waitingOn, playerId);
    
  })
  

});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

function getUnlockedPlayers(players) {
  var waitingOn = [];

  for (const id in players) {
    if (!(players[id].lockedIn) && players[id].playerName) {
      waitingOn.push(players[id].playerName);
    }
  }
  return waitingOn;
}