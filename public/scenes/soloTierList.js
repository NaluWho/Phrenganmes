
export class SoloTierListScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SoloTierList' });
    }

    create() {
        var self = this;
        console.log('SoloTierList scene was created');
        var promptIndex = 0;
        
        this.socket = io();
        this.allPlayers = {};
        this.socket.emit('newScene', this.socket.id);
        
        this.tierListData = new TierListData();
        this.height = this.cameras.main.height;
        this.width = this.cameras.main.width;
        this.tierRectHeight = this.height*0.11;
        this.tierRectWidth = this.width*0.09;
        this.offsetY = 84;
        
        this.socket.on('newSoloTier', function (players) {
            self.allPlayers = players;
            self.allPlayers["socketIdEx"] = {playerName: "testUser"}; // For testing

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
                    self.createDraggableRect(playerName, rectXoffset);
                    widthOffset++;
                }
            }
        });

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

            dragY = Phaser.Math.Clamp(dragY, this.tierRectHeight+this.offsetY, this.tierRectHeight*7+this.offsetY);
            // TODO: Clamp to left most spot
            var tier = this.getTierFromY(dragY);
            var newRightClamp = this.tierListData.getTierListArrayByLetter(tier).length + 3;
            dragX = Phaser.Math.Clamp(dragX, this.tierRectWidth*3-offsetX, this.tierRectWidth*newRightClamp-offsetX);
            // dragX = Phaser.Math.Clamp(dragX, this.tierRectWidth*3-offsetX, this.tierRectWidth*11-offsetX);
            gameObject.setPosition(dragX, dragY);
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            var newTier = this.getTierFromY(pointer.upY);
            var newIndex = this.getIndexFromX(pointer.upX);
            var oldIndex = this.getIndexFromX(pointer.downX);
            if (newTier) {
                // var givenUsername = this.getUserNameFromPointer(gameObject);
                var givenUsername = gameObject.list[1]._text;
                this.tierListData.removeFromTier(givenUsername, oldIndex);
                this.tierListData.addToTier(newTier, givenUsername, newIndex);
            }
            console.log("Tierlist: ", this.tierListData);
        });

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
        return null;
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
}
