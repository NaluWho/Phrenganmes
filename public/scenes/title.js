
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Title' });
    }

    create() {
        var self = this;
        console.log('Title scene was created');
        
        var titleTextConfig = { fontSize: '80px', color:'#eeeeee', fontFamily: 'Arial' };
        var height = this.cameras.main.height;
        var width = this.cameras.main.width;
        this.tierListingtitleText = this.add.text(width/2, 2*height/5, 'Tier Listing', titleTextConfig).setOrigin(0.5,0.5);

        var subtitleTextConfig = { fontSize: '40px', color:'#adadad', fontFamily: 'Arial' };
        var subTitleText = 'What do your friends really think of you?';
        this.tierListingtitleText = this.add.text(width/2, 3*height/5, subTitleText, subtitleTextConfig).setOrigin(0.5,0.5);

        // New Scene on Click
        this.input.on('pointerup', () => this.scene.start("Lobby"));
    }
}