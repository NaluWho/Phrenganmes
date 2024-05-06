
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
        
        this.height = this.cameras.main.height;
        this.width = this.cameras.main.width;
        this.tierRectHeight = this.height*0.11; // Use 0.13 for 5 tiers, 0.11 for 6 tiers
        var heightOffset = this.tierRectHeight*0.35;
        if (this.tierRectHeight == this.height*0.13) {
            heightOffset = 0;
        }
        
        this.socket.on('newSoloTier', function (players) {
            self.allPlayers = players;
            self.allPlayers["socketIdEx"] = {playerName: "testUser"}; // For testing

            // Tier Rectangles
            self.createTierLayout();

            // Create Draggable Rect for each Player
            var widthOffset = 0;
            for (const user in self.allPlayers) {
                if (self.allPlayers[user].playerName != "") {
                    var rectX = 0.09*widthOffset;
                    self.createDraggableRect(self.allPlayers[user].playerName, heightOffset);
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

    createDraggableRect(userName, heightOffset) {
        const rect1 = this.add.rectangle(0, 0, this.width*0.09, this.tierRectHeight, 0x303030).setOrigin(0.45, 0.58);

        var usernamesConfig = { fontSize: '12px', color:'#ffffff', fontFamily: 'Arial', textAlign: 'center' };
        var user1 = this.add.text(0, 0, userName, usernamesConfig).setOrigin(0.45, 0.75);

        var cont1 = this.add.container(this.width/2, this.tierRectHeight*7, [rect1, user1]);
        cont1.setSize(200,200);

        // For less tiers subtract multiplier constant
        var heightMax = this.tierRectHeight*8+heightOffset;
        if (heightOffset == 0) {
            heightMax = this.tierRectHeight*7;
        }

        cont1.setInteractive({ draggable: true });
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            dragX = Phaser.Math.Snap.To(dragX, this.width*0.09);
            dragY = Phaser.Math.Snap.To(dragY, this.tierRectHeight, heightOffset, false);

            dragX = Phaser.Math.Clamp(dragX, this.width*0.18, this.width*0.9);
            dragY = Phaser.Math.Clamp(dragY, this.tierRectHeight*2+heightOffset, heightMax);
            gameObject.setPosition(dragX, dragY);
        });
    }
}
