import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import PreloadScene from './scenes/PreloadScene';
import { StartScene } from './scenes/StartScene';

export const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1920,
    height: 1080,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#44aa44',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [StartScene, PreloadScene, MainScene],
  pixelArt: true,
  roundPixels: true,
  banner: true,
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  }
}; 