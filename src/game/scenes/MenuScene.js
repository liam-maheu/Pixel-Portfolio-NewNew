import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor(key, title) {
    super({ key });
    this.title = title;
  }

  create() {
    // Add semi-transparent black background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    bg.setOrigin(0);
    bg.setScrollFactor(0);

    // Add title
    const titleText = this.add.text(this.cameras.main.width / 2, 100, this.title, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    titleText.setScrollFactor(0);

    // Add back button
    const backButton = this.add.container(60, 60);
    
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x2196F3);
    buttonBg.fillCircle(0, 0, 30);
    buttonBg.lineStyle(2, 0x1976D2);
    buttonBg.strokeCircle(0, 0, 30);

    const buttonText = this.add.text(0, 0, '←', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    backButton.add([buttonBg, buttonText]);
    backButton.setScrollFactor(0);

    // Make back button interactive
    const hitArea = this.add.graphics();
    hitArea.fillStyle(0x000000, 0);
    hitArea.fillCircle(0, 0, 30);
    hitArea.setInteractive(
      new Phaser.Geom.Circle(0, 0, 30),
      Phaser.Geom.Circle.Contains
    );

    hitArea.on('pointerdown', () => {
      this.scene.start('MainScene');
    });

    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x42A5F5);
      buttonBg.fillCircle(0, 0, 30);
      buttonBg.lineStyle(2, 0x1976D2);
      buttonBg.strokeCircle(0, 0, 30);
    });

    hitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x2196F3);
      buttonBg.fillCircle(0, 0, 30);
      buttonBg.lineStyle(2, 0x1976D2);
      buttonBg.strokeCircle(0, 0, 30);
    });

    backButton.add(hitArea);
  }
} 