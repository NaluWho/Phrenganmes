var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var { Server } = require("socket.io");
var io = new Server(server);
var TierListData = require("./public/util/tierListData.js");

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
      console.log("No one waiting");
    }
    socket.emit('waitingOn', waitingOn, playerId);
    socket.broadcast.emit('waitingOn', waitingOn, playerId);
  })

  socket.on('combinedResults', function () {
    console.log("Calculating Combined Results...");
    calculateCombinedResults(players);
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

function calculateCombinedResults(players) {
    const tierWeights = {
        "S": 100,
        "A": 80,
        "B": 60,
        "C": 40,
        "D": 20,
        "F": 0
    };
    // Key: PlayerName
    // Value: Summed Weight (Int)
    var playersByRating = {};
    Object.entries(players).forEach(([key, value]) => {
      playersByRating[players[key].playerName] = 0;
    })

    // Get each player's solo tier list
    for (const id in players) {
      // Assign weight to each player
      var soloList = players[id].soloTierList;
      var individualTierList = new TierListData(
        soloList.sTier,
        soloList.aTier,
        soloList.bTier,
        soloList.cTier,
        soloList.dTier,
        soloList.fTier
      );

      // Check each tier
      for (const [tierLetter, tierWeightValue] of Object.entries(tierWeights)) {
        var playersInTier = individualTierList.getTierListArrayByLetter(tierLetter);
        console.log("In tier", tierLetter, " Players: ", playersInTier);
        // Per person in tier, update rating
        for (var i=0; i<playersInTier.length; i++) {
          var rankedName = playersInTier[i];
          playersByRating[rankedName] += tierWeightValue;
        }
      }
    }

    // Sort players into tiers by average ratings
    var combinedTierList = new TierListData();
    const numOfPlayers = Object.keys(playersByRating).length;
    for (const [name, rating] of Object.entries(playersByRating)) {
      var avgRating = playersByRating[name] / numOfPlayers;
      if (avgRating > 78) {
        combinedTierList.addToTier("S", name);
      }
      else if (avgRating > 62) {
        combinedTierList.addToTier("A", name);
      }
      else if (avgRating > 50) {
        combinedTierList.addToTier("B", name);
      }
      else if (avgRating > 38) {
        combinedTierList.addToTier("C", name);
      }
      else if (avgRating > 22) {
        combinedTierList.addToTier("D", name);
      }
      else {
        combinedTierList.addToTier("F", name);
      }
    }

    console.log(combinedTierList);
}