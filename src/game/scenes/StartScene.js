import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    // Simple black background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
      .setOrigin(0);

    // Title with fantasy styling
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 3,
      'The Crystal Codex',
      {
        fontSize: '72px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
        stroke: '#4a54df',
        strokeThickness: 8,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: '#2a3474',
          blur: 8,
          fill: true
        }
      }
    ).setOrigin(0.5);

    // Subtitle
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2.5,
      'a game created by liam maheu',
      {
        fontSize: '32px',
        color: '#9aa5f9',
        fontFamily: 'Georgia, serif'
      }
    ).setOrigin(0.5);

    // Start button with fantasy styling
    const startButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Begin Journey',
      {
        fontSize: '36px',
        color: '#ffffff',
        backgroundColor: '#4a54df',
        padding: { x: 30, y: 15 },
        fontFamily: 'Georgia, serif',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // Hover effect
    startButton.on('pointerover', () => {
      startButton.setBackgroundColor('#5a64ef');
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setBackgroundColor('#4a54df');
      startButton.setScale(1);
    });

    // Click to start game
    startButton.on('pointerdown', () => {
      this.scene.start('MainScene');
    });

    // Also allow space key to start
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });
  }
} 