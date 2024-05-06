
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
    }

    create() {
        console.log('Preloader...');

        // this.scene.start("Title");
        this.scene.start("SoloTierList"); // FOR TESTING
    }

  
}