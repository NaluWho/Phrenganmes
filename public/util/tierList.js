class TierList {
    constructor(phaserThis) {
        this.self = phaserThis;
    }

    
    createTierLayout(phaserThis) {
        var numberOfTiers = 6;
        var startY = phaserThis.height/4;

        // Tier Rectangles
        var tierRectColor = 0xadadad;
        for (let i = 0; i < numberOfTiers; i++) {
            if (i % 2 == 0) {
                tierRectColor = 0xadadad;
            } else {
                tierRectColor = 0xeeeeee;
            }
            phaserThis.add.rectangle(phaserThis.width/2, startY+phaserThis.tierRectHeight*i, phaserThis.width*0.9, phaserThis.tierRectHeight, tierRectColor);
        }

        // Tier Letters Boxes
        var tierLetterBoxColorArray = [0x00ffff, 0x00ff00,0xffff00, 0xff9900, 0xff0000, 0x666666];
        if (tierLetterBoxColorArray.length != numberOfTiers) {
            console.log("ERROR: Number of Tier Letter Boxes not same as number of tiers.");
        }
        for (let i = 0; i < tierLetterBoxColorArray.length; i++) {
            phaserThis.add.rectangle(phaserThis.width*0.0955, startY+phaserThis.tierRectHeight*i, phaserThis.width*0.09, phaserThis.tierRectHeight, tierLetterBoxColorArray[i]);
        }

        // Tier Letters
        var tierLetterArray = ["S", "A", "B", "C", "D", "F"];
        if (tierLetterArray.length != numberOfTiers) {
            console.log("ERROR: Number of Tier Letters not same as number of tiers.");
        }
        var tierLetterConfig = { fontSize: '30px', color:'#000', fontFamily: 'Arial', textAlign: 'center' };
        for (let i = 0; i < tierLetterArray.length; i++) {
            phaserThis.add.text(phaserThis.width*0.0955, startY+phaserThis.tierRectHeight*i, tierLetterArray[i], tierLetterConfig).setOrigin(0.5,0.5);
        }
    }
}