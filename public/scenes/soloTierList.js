
export class SoloTierListScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SoloTierList' });
    }

    create() {
        var self = this;
        console.log('SoloTierList scene was created');
        var promptIndex = 0;
        
        this.socket = this.registry.get('socket');
        this.socket.emit('newScene', this.socket.id);
        
        this.allPlayers = {};
        this.tierListData = new TierListData();
        this.height = this.cameras.main.height;
        this.width = this.cameras.main.width;
        this.tierRectHeight = this.height*0.11;
        this.tierRectWidth = this.width*0.09;
        this.offsetY = 84;
        this.rectContainers = [];
        this.lockedIn = false;
        this.setUpWaitingOn();

        this.clickButton = this.add.text(this.width*0.5, this.height*0.9, 'Lock In', { fill: '#fff' })
                            .setOrigin(0.5,0.5)
                            .setInteractive()
                            .on('pointerover', () => this.clickButton.setStyle({ fill: '#ff0'}) )
                            .on('pointerout', () => this.clickButton.setStyle({ fill: '#0f0' }) )
                            .on('pointerup', function() {
                                this.lockIn();
                            }, this );
        this.clickButton.visible = false;
        
        this.socket.on('newSoloTier', function (players) {
            self.allPlayers = players;

            // Tier Rectangles
            self.createTierLayout();

            // Create Draggable Rect for each Player
            var widthOffset = 0;
            var rectXoffset = 0;
            for (const user in self.allPlayers) {
                var playerName = self.allPlayers[user].playerName;
                if (playerName != "") {
                    // Add user to untiered
                    self.tierListData.addToTier(null, playerName, widthOffset);
                    // Create a Rectangle for them
                    rectXoffset = self.width*0.09*widthOffset;
                    var newRectObj = self.createDraggableRect(playerName, rectXoffset);
                    self.rectContainers.push(newRectObj);
                    widthOffset++;
                }
            }
        });

        // Displays each un-locked-in player
        this.socket.on('waitingOn', function (waitingOnPlayersArr, playerId) {
            console.log("In waitingOn");
            if (!self.lockedIn) {
                return;
            }

            if (waitingOnPlayersArr.length == 0) {
                self.scene.start("CombinedResults");
            }

            // If another player locks in update waiting on list
            if (playerId != self.socket.id) {
                self.setWaitingOnToInvisible();
            }

            self.clickButton.setText("Un-lock In");
            self.waitingNamesBackRect.setVisible(true);
            self.waitingOnText.setVisible(true);
            var numWaitingOnPlayers = waitingOnPlayersArr.length;
            for (let i=0; i<numWaitingOnPlayers; i++) {
                console.log("   Waiting on Player: ", waitingOnPlayersArr[i]);
                var nameTextX = self.width*((i+1)/(numWaitingOnPlayers+1));
                var nameTextY = self.height*0.55;
                var waitingOnNameText = self.add.text(nameTextX, nameTextY, waitingOnPlayersArr[i], self.waitingNameTextConfig)
                                                        .setOrigin(0.5, 0.5)
                                                        .setDepth(1);
                self.waitingOnNameArray.push(waitingOnNameText);
            }
        })

        // Prompt Text
        var promptTextConfig = { fontSize: '30px', color:'#eeeeee', fontFamily: 'Arial', textAlign: '' };
        this.tierListingPromptText = this.add.text(this.width/2, this.height/10, tierlistPromptList[promptIndex], promptTextConfig).setOrigin(0.5,0.5);

    }

    createTierLayout() {
        var numberOfTiers = 6;
        var startY = this.height/4;

        // Tier Rectangles
        var tierRectColor = 0xadadad;
        for (let i = 0; i < numberOfTiers; i++) {
            if (i % 2 == 0) {
                tierRectColor = 0xadadad;
            } else {
                tierRectColor = 0xeeeeee;
            }
            this.add.rectangle(this.width/2, startY+this.tierRectHeight*i, this.width*0.9, this.tierRectHeight, tierRectColor);
        }

        // Tier Letters Boxes
        var tierLetterBoxColorArray = [0x00ffff, 0x00ff00,0xffff00, 0xff9900, 0xff0000, 0x666666];
        if (tierLetterBoxColorArray.length != numberOfTiers) {
            console.log("ERROR: Number of Tier Letter Boxes not same as number of tiers.");
        }
        for (let i = 0; i < tierLetterBoxColorArray.length; i++) {
            this.add.rectangle(this.width*0.0955, startY+this.tierRectHeight*i, this.width*0.09, this.tierRectHeight, tierLetterBoxColorArray[i]);
        }

        // Tier Letters
        var tierLetterArray = ["S", "A", "B", "C", "D", "F"];
        if (tierLetterArray.length != numberOfTiers) {
            console.log("ERROR: Number of Tier Letters not same as number of tiers.");
        }
        var tierLetterConfig = { fontSize: '30px', color:'#000', fontFamily: 'Arial', textAlign: 'center' };
        for (let i = 0; i < tierLetterArray.length; i++) {
            this.add.text(this.width*0.0955, startY+this.tierRectHeight*i, tierLetterArray[i], tierLetterConfig).setOrigin(0.5,0.5);
        }
    }

    createDraggableRect(userName, offsetX) {
        const rect1 = this.add.rectangle(0, 0, this.tierRectWidth, this.tierRectHeight, 0x303030).setOrigin(0.45, 0.5);

        var usernamesConfig = { fontSize: '12px', color:'#ffffff', fontFamily: 'Arial', textAlign: 'center' };
        var user1 = this.add.text(0, 0, userName, usernamesConfig).setOrigin(0.45, 0.5);

        var cont1 = this.add.container(this.tierRectWidth*2+offsetX, this.tierRectHeight*7+this.offsetY, [rect1, user1]);
        cont1.setSize(this.tierRectWidth, this.tierRectHeight);

        cont1.setInteractive({ draggable: true })

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            dragX = Phaser.Math.Snap.To(dragX, this.tierRectWidth);
            dragY = Phaser.Math.Snap.To(dragY, this.tierRectHeight, this.offsetY);

            var tier = this.getTierFromY(dragY);
            var newRightClamp = this.tierListData.getTierListArrayByLetter(tier).length + 2;

            // If dragging rect in same tier, don't allow extra room
            var givenUsername = this.getUsernameFromContainer(gameObject);
            if (userName == givenUsername) {
                var newTier = this.tierListData.nameToTier[givenUsername];
                if (tier == newTier) {
                    newRightClamp -= 1;
                }
                dragX = Phaser.Math.Clamp(dragX, this.tierRectWidth*2, this.tierRectWidth*newRightClamp);
                dragY = Phaser.Math.Clamp(dragY, this.tierRectHeight+this.offsetY, this.tierRectHeight*7+this.offsetY);
                gameObject.setPosition(dragX, dragY);
            }
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            var givenUsername = this.getUsernameFromContainer(gameObject);

            if (userName == givenUsername) {
                var newIndex = this.getIndexFromX(gameObject.x);
                var newTier = this.getTierFromY(gameObject.y);
                var oldIndex = this.getIndexFromX(gameObject.input.dragStartX);
                var oldTier = this.getTierFromY(gameObject.input.dragStartY);

                if (oldTier != newTier || oldIndex != newIndex) {
                    var newTierArrLength = this.tierListData.getTierListArrayByLetter(newTier).length;
                    
                    this.tierListData.removeFromTier(givenUsername);
                    this.tierListData.addToTier(newTier, givenUsername, newIndex);
                    
                    // Shift other rectangles to right if placed ontop
                    if (newIndex < newTierArrLength) {
                        this.shiftRectsRight(newTier, newIndex, oldTier, oldIndex, givenUsername);
                    }

                    // Shift other rectangles to left if placed ontop or after
                    var oldTierArrLength = this.tierListData.getTierListArrayByLetter(oldTier).length;
                    if ((newTier != oldTier) && (oldIndex < oldTierArrLength) || ((newTier == oldTier) && (newIndex > oldIndex))) {
                        this.shiftRectsLeft(oldTier, oldIndex, givenUsername);
                    }
                    
                    // If no players untiered, allow finish
                    if (this.tierListData.getTierListArrayByLetter().length == 0) {
                        this.clickButton.setText("Lock In");
                        this.clickButton.visible = true;
                    } else {
                        this.clickButton.visible = false;
                        this.waitingNamesBackRect.setVisible(false);
                        this.waitingOnText.setVisible(false);
                        this.setWaitingOnToInvisible();
                        if (this.lockedIn) {
                            this.lockedIn = false;
                            this.socket.emit("soloUnLockedIn", this.socket.id);
                        }
                    }
                }
                console.log("Tierlist: ", this.tierListData);
            }
        });
        return cont1;
    }

    getTierFromY(y) {
        var heightMultiplier = (y - this.offsetY) / this.tierRectHeight;
        if ((y - this.offsetY) % this.tierRectHeight >= this.tierRectHeight / 2) {
            heightMultiplier = Math.ceil(heightMultiplier);
        } else {
            heightMultiplier = Math.floor(heightMultiplier);
        }
        if (heightMultiplier == 1) {
            return "S";
        } else if (heightMultiplier == 2) {
            return "A";
        } else if (heightMultiplier == 3) {
            return "B";
        } else if (heightMultiplier == 4) {
            return "C";
        } else if (heightMultiplier == 5) {
            return "D";
        } else if (heightMultiplier == 6) {
            return "F";
        }
        return "Untiered";
    }

    getIndexFromX(x) {
        var widthMultiplier = x / this.tierRectWidth;
        if (x % this.tierRectWidth >= this.tierRectWidth / 2) {
            widthMultiplier = Math.ceil(widthMultiplier);
        } else {
            widthMultiplier = Math.floor(widthMultiplier);
        }
        if (widthMultiplier < 0) {
            console.log("ERROR: x coordinate of draggable box = ", x / this.tierRectWidth);
        }
        return widthMultiplier - 2;
    }

    getUserNameFromPointer(pointer) {
        var userTier = this.getTierFromY(pointer.downY);
        var userIndex = this.getIndexFromX(pointer.downX);
        var tierList = this.tierListData.getTierListArrayByLetter(userTier);
        return tierList[userIndex];
    }

    shiftRectsRight(newTier, newIndex, oldTier, oldIndex, username) {
        for (var i=0; i<this.rectContainers.length; i++) {
            var cont = this.rectContainers[i];
            var contName = this.getUsernameFromContainer(cont);
            var contTier = this.tierListData.nameToTier[contName];
            var contIndex = this.tierListData.getTierListArrayByLetter(contTier).indexOf(contName);
            if (oldTier != newTier) {
                oldIndex = this.tierListData.getTierListArrayByLetter(contTier).length;
            }
            // console.log("   New Indices Equal?:", (newIndex <= contIndex), "(", newIndex, "<=", contIndex, ")");
            // console.log("   Old Indices Equal?:", (contIndex <= oldIndex), "(", contIndex, "<=", oldIndex, ")");
            // console.log("   Name?:", contName);
            if ((newIndex <= contIndex) && (contIndex <= oldIndex) && (username != contName) && (contTier == newTier)) {
                console.log("Shift Right");
                cont.setX(cont.x + this.tierRectWidth);
            }
        }
    }
    
    shiftRectsLeft(oldTier, oldIndex, username) {
        for (var i=0; i<this.rectContainers.length; i++) {
            var cont = this.rectContainers[i];
            var contName = this.getUsernameFromContainer(cont);
            var contTier = this.tierListData.nameToTier[contName];
            var contIndex = this.tierListData.getTierListArrayByLetter(contTier).indexOf(contName);
            var tierLength = this.tierListData.getTierListArrayByLetter(contTier).length;
            // console.log("   Tiers Equal?:", (contTier == oldTier));
            // console.log("   Indices Equal?:", (oldIndex <= contIndex), "(", oldIndex, "<=", contIndex, ")");
            // console.log("   Indices v Len Equal?:", (contIndex >= tierLength), "(", contIndex, ">=", tierLength, ")");
            // console.log("   Name?:", (contName));
            if ((oldIndex <= contIndex) && (username != contName) && (contTier == oldTier)) {
                console.log("Shift Left");
                cont.setX(cont.x - this.tierRectWidth);
            }
        }
    }

    getUsernameFromContainer(cont) {
        return cont.list[1]._text;
    }

    lockIn() {
        // If already locked in then unlock
        if (this.lockedIn) {
            this.waitingNamesBackRect.setVisible(false);
            this.waitingOnText.setVisible(false);
            this.setWaitingOnToInvisible();
            this.clickButton.setText("Lock In");
            this.socket.emit("soloUnLockedIn", this.socket.id);
            this.lockedIn = false;
        } else {
            console.log("Emitting soloLockedIn");
            this.socket.emit("soloLockedIn", this.socket.id, this.tierListData);
            this.lockedIn = true;
        }
    }

    setUpWaitingOn() {
        this.waitingNamesBackRect = this.add.rectangle(this.width*0.5, this.height*0.5, this.width*0.5, this.height*0.25, 0xdddddd)
                                                        .setOrigin(0.5, 0.5)
                                                        .setDepth(1);
        this.waitingNameTextConfig = { fontSize: '18px', color:'#111111', fontFamily: 'Arial', textAlign: 'center' };
        this.waitingOnText =  this.add.text(this.width*0.5, this.height*0.45, "Waiting On:", this.waitingNameTextConfig)
                                            .setOrigin(0.5, 0.5)
                                            .setDepth(1);
        this.waitingOnNameArray = [];
        
        // Set not visible until locked in
        this.waitingNamesBackRect.setVisible(false);
        this.waitingOnText.setVisible(false);
    }

    setWaitingOnToInvisible() {
        for (var i=0; i<this.waitingOnNameArray.length; i++) {
            this.waitingOnNameArray[i].setVisible(false);
        }
        // Empty Array
        this.waitingOnNameArray = [];
    }
}
