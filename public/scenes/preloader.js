
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        this.load.image('ship', '../assets/spaceShips_001.png');
        this.load.image('otherPlayer', '../assets/enemyBlack5.png');
        this.load.image('star', '../assets/star_gold.png');
    }

    create() {
        console.log('Preloader...');

        this.scene.start("Title");
        // this.scene.start("SoloTierList"); // FOR TESTING
    }

  
}