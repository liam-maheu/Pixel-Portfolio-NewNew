import Phaser from 'phaser';
import { store } from '../store';
import { updatePlayerPosition } from '../store/slices/gameSlice';
import MainScene from './scenes/MainScene';
import { StartScene } from './scenes/StartScene';
import { 
  PortfolioScene, 
  AboutScene, 
  SkillsScene, 
  ProjectsScene, 
  ContactScene,
  ResumeScene 
} from './scenes/MenuScenes';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    StartScene    // Temporarily only loading StartScene for debugging
  ]
};

console.log('Game configuration loaded');
export default new Phaser.Game(config); 