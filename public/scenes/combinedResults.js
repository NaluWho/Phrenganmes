
export class CombinedResults extends Phaser.Scene {
    constructor() {
        super({ key: 'CombinedResults' });
    }

    create() {
        console.log('CombinedResults scene was created');
        
        this.socket = this.registry.get('socket');
        this.socket.emit('combinedResults');
    }

  
}