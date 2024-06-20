
export class CombinedResults extends Phaser.Scene {
    constructor() {
        super({ key: 'CombinedResults' });
    }

    create() {
        console.log('CombinedResults scene was created');
        
        this.socket = this.registry.get('socket');
        this.socket.emit('combinedResults');

        this.height = this.cameras.main.height;
        this.width = this.cameras.main.width;
        this.tierRectHeight = this.height*0.11;
        this.tierRectWidth = this.width*0.09;

        // var parentScene = this.scene.get('SoloTierList');
        // parentScene.createTierLayout(this);
        var tierList = new TierList(this);
        tierList.createTierLayout(this);
    }

}