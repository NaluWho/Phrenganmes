import { Preloader } from './scenes/preloader.js';
import { TitleScene } from './scenes/title.js';
import { LobbyScene } from './scenes/lobby.js';
import { SoloTierListScene } from './scenes/soloTierList.js';

var config = {
  title: "Tier Listing",
  type: Phaser.AUTO,
  backgroundColor: '#212121',
  parent: 'phaser-game',
  width: 900,
  height: 600,
  // width:  window.innerWidth * window.devicePixelRatio,
  // height: window.innerHeight * window.devicePixelRatio,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [
    Preloader,
    TitleScene,
    LobbyScene,
    SoloTierListScene
  ]
};

var game = new Phaser.Game(config);