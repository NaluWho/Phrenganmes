
export class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Lobby' });
    }

    create() {
        var self = this;
        console.log('Lobby scene was created');
        this.sceneWidth = this.scene.systems.canvas.width;
        this.sceneHeight = this.scene.systems.canvas.height;
        
        // Set Title Text
        var titleTextConfig = { fontSize: '50px', color:'#eeeeee', fontFamily: 'Arial' };
        var whoInText = "Who's In?"
        this.tierListingtitleText = this.add.text(this.sceneWidth/2, this.sceneHeight/4, whoInText, titleTextConfig).setOrigin(0.5,0.5);

        // Introduce Multiplayer
        this.socket = io();
        /*
            Key:    Socket Id (Int)
            Value: {
                    playerId (Int)
                    playerName (String)
                    nameText (Text Object)
                    }
        */
        this.allPlayers = {};
        
        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                var player = {playerId: players[id].playerId, playerName: "", nameText: null};
                self.allPlayers[players[id].playerId] = player;
            });
            self.writeOtherPlayerNames("", self.socket.id, players);
        });
        this.socket.on('newPlayer', function (playerInfo) {
            var otherPlayer = playerInfo;
            self.allPlayers[otherPlayer.playerId] = otherPlayer;
        });
        this.socket.on('disconnectedUser', function (playerId, players) {
            console.log("Socket Disconnect (disconnectedUser)");
            if (self.allPlayers[playerId].nameText != undefined) {
                self.allPlayers[playerId].nameText.destroy();
            }
            delete self.allPlayers[playerId];
            self.writeOtherPlayerNames("", playerId, players);
        });
        
        // When player named, display name
        this.socket.on('playerNamed', function (playerId, players) {
            self.allPlayers[playerId].playerName = players[playerId].playerName;
            self.writeOtherPlayerNames(self.allPlayers[playerId].playerName, playerId, players);
        });

        ///////////////////////////////////////////////////////////

        // Text Input Box
        this.formUtil = new FormUtil({
            scene: this,
            rows: 11,
            cols: 11
        });
        this.welcomeText = this.add.text(this.sceneWidth/2, 2.3*this.sceneHeight/5, '', {"text-align": 'center'}).setOrigin(0.5,0.5);

        this.formUtil.showElement("nameTextInput");
        this.formUtil.scaleToGameW("nameTextInput", 0.3);
        this.formUtil.placeElementByPosAt(this.sceneWidth/2, 3*this.sceneHeight/5, "nameTextInput");
        this.formUtil.addChangeCallback("nameTextInput", this.textAreaChanged, this);

        // Button
        this.clickButton = this.add.text(this.sceneWidth/2, 3*this.sceneHeight/5, 'Ready?', { fill: '#0f0' })
            .setOrigin(0.5,0.5)
            .setInteractive()
            .on('pointerover', () => this.enterButtonHoverState() )
            .on('pointerout', () => this.enterButtonRestState() )
            .on('pointerdown', function() {
                this.formUtil.hideElement("nameTextInput");
                this.scene.start("SoloTierList");
            }, this );
    }

    textAreaChanged() {
        // TODO: Add character limit 10
        var userInputName = this.formUtil.getTextAreaValue("nameTextInput"); // Check security lol
        this.updateWelcomeText(userInputName);
        this.socket.emit('playerNaming', userInputName, this.socket.id);
    }
    
    updateWelcomeText(userInputName) {
        this.welcomeText.setText(`Welcome ${userInputName}`);
    }

    enterButtonHoverState() {
        if (this.welcomeText.text == "") {
            this.clickButton.setText("Please type a name and hit enter first.");
        }
        this.clickButton.setStyle({ fill: '#ff0'});
    }

    enterButtonRestState() {
        this.clickButton.setText("Ready?");
        this.clickButton.setStyle({ fill: '#0f0' });
    }

    // Adds New Name to Player Name Dict and Prints to Screen
    writeOtherPlayerNames(newName, socketId, players) {
        var playerNameTextConfig = { fontSize: '24px', color:'#eeeeee', fontFamily: 'Arial', textAlign: 'center' };

        // Get Number of Players
        var numOfNamedPlayers = 0;
        for (const key in players) {
            if (players[key].playerName != "") {
                numOfNamedPlayers++;
            }
        }
        var nameHeightDivision = this.sceneHeight / Math.max(2, (1+Math.ceil(numOfNamedPlayers/2)));

        // If no named players, exit early
        if (numOfNamedPlayers == 0 && newName == "") {
            return;
        }

        // In case of just named, update dictionary
        if ( newName != "" && (players[socketId] == undefined || players[socketId].playerName == "")) {
            players[socketId] = {playerId: socketId, playerName: newName};
        }

        var i = 0;
        var name = "";
        for (const key in players) {
            if (players[key].playerName != "") {
                // Delete Old Name
                if (this.allPlayers[key] != undefined && this.allPlayers[key].nameText != undefined) {
                    this.allPlayers[key].nameText.destroy();
                }

                // Get Name for Text
                if (key == socketId) {
                    name = newName;
                    if (players[key].nameText) {
                        console.log("There's an existing text somehow...: ", name);
                    }
                } else {
                    name = players[key].playerName;
                }

                // Offset to Left and Right side of screen
                if (i % 2 == 0) {
                    var nameTextObj = this.add.text(this.sceneWidth*0.2, nameHeightDivision*Math.ceil((i+1)/2), name, playerNameTextConfig).setOrigin(0.5,0.5);
                } else {
                    var nameTextObj = this.add.text(this.sceneWidth*0.8, nameHeightDivision*Math.ceil(i/2), name, playerNameTextConfig).setOrigin(0.5,0.5);
                }

                // Add player with new name to dictionary
                if (this.allPlayers[key] == undefined) {
                    this.allPlayers[key] = {playerId: key, playerName: name, nameText: nameTextObj};
                } else {
                    this.allPlayers[key].nameText = nameTextObj;
                }
                
                i++;
            }
        }
    }

    update() {}
}
