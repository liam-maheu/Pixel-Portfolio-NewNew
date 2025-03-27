import Phaser from 'phaser';
import { store } from '../../store';
import { updatePlayerPosition } from '../../store/slices/gameSlice';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.facing = 'down';
    this.interactables = [];
    this.currentInteractable = null;
    this.interactionKey = null;
    // Make the world much larger than the viewport
    this.mapWidth = 3840;  // 2x wider
    this.mapHeight = 3240; // 3x taller
    this.structures = [];
    this.riverBounds = [];
    this.bgMusic = null; // Add background music reference
    this.isMenuOpen = false; // Add menu state tracking
  }

  init(data) {
    // Initialize any data passed from StartScene
    console.log('MainScene initialized');
  }

  preload() {
    // Create textures for interactable objects
    const graphics = this.add.graphics();
    
    // Player texture
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('placeholder', 32, 32);
    
    // Interactable texture
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('interactable', 32, 32);

    // Structure textures
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture('building', 64, 64);

    // Bridge texture - brown walkable platform
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 200, 800); // Vertical bridge (width: 200, height: 800)
    graphics.generateTexture('bridge', 200, 800);

    // Bridge rail texture - thinner rails
    graphics.clear();
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(0, 0, 20, 800); // Vertical rail
    graphics.generateTexture('bridge_rail', 20, 800);

    // Small structure texture
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('small_structure', 32, 32);
    
    graphics.destroy();

    // Load background music
    this.load.audio('bgMusic', '/assets/audio/background-music.mp3');
  }

  create() {
    // Create world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Create a background that fills the entire world
    this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x44aa44).setOrigin(0);

    // Add grid lines to help visualize the world size
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x336633);
    
    // Draw vertical lines
    for (let x = 0; x < this.mapWidth; x += 192) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.mapHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y < this.mapHeight; y += 192) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.mapWidth, y);
    }
    graphics.stroke();

    // Create environment in specific order
    this.createRiver();
    this.createBridges();
    this.createStructures();
    this.createDenseEnvironment();

    // Add a simple player placeholder
    this.player = this.physics.add.sprite(this.mapWidth / 2, 200, 'placeholder');
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(100, 100);

    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Add ESC key binding
    this.input.keyboard.on('keydown-ESC', () => {
      this.toggleMenu();
    });

    // Create menu button
    this.createMenuButton();

    // Add minimap (moved to top right and made circular)
    const minimapX = this.cameras.main.width - 210;
    const minimapY = 10;
    this.minimap = this.cameras.add(minimapX, minimapY, 200, 200).setZoom(0.05).setName('mini');
    this.minimap.setBackgroundColor(0x002200);
    this.minimap.startFollow(this.player);
    this.minimap.setAlpha(0.8);

    // Create circular mask for minimap
    const shape = this.make.graphics();
    shape.fillStyle(0xffffff);
    shape.beginPath();
    shape.arc(minimapX + 100, minimapY + 100, 100, 0, Math.PI * 2, true);
    shape.closePath();
    shape.fill();

    const mask = shape.createGeometryMask();
    this.minimap.setMask(mask);

    // Add music controls (moved to top left)
    const musicButton = this.add.text(20, 20, '🔊', {
      fontSize: '32px',
      fill: '#fff'
    })
    .setScrollFactor(0)
    .setInteractive();

    musicButton.on('pointerdown', () => {
      if (this.bgMusic.isPlaying) {
        this.bgMusic.pause();
        musicButton.setText('🔈');
      } else {
        this.bgMusic.resume();
        musicButton.setText('🔊');
      }
    });

    // Add collisions with structures and river
    this.physics.add.collider(this.player, this.structures);
    this.physics.add.collider(this.player, this.riverBounds);

    // Add background music
    this.bgMusic = this.sound.add('bgMusic', {
      volume: 0.5,
      loop: true
    });
    this.bgMusic.play();
  }

  createRiver() {
    const riverGraphics = this.add.graphics();
    
    // Main river body
    riverGraphics.fillStyle(0x4444ff, 1);
    riverGraphics.fillRect(0, this.mapHeight / 2 - 200, this.mapWidth, 400);

    // River details
    riverGraphics.fillStyle(0x6666ff, 0.5);
    for (let x = 0; x < this.mapWidth; x += 200) {
      riverGraphics.fillRect(x, this.mapHeight / 2 - 180, 100, 360);
    }

    // Create two river collision bodies with a gap for the bridge
    const bridgeWidth = 200;
    const bridgeX = this.mapWidth / 2;

    // Left part of river
    const leftRiver = this.physics.add.sprite(bridgeX - this.mapWidth/4, this.mapHeight / 2, null);
    leftRiver.setVisible(false);
    leftRiver.setImmovable(true);
    leftRiver.setDisplaySize(this.mapWidth/2 - bridgeWidth, 400);
    this.riverBounds.push(leftRiver);

    // Right part of river
    const rightRiver = this.physics.add.sprite(bridgeX + this.mapWidth/4, this.mapHeight / 2, null);
    rightRiver.setVisible(false);
    rightRiver.setImmovable(true);
    rightRiver.setDisplaySize(this.mapWidth/2 - bridgeWidth, 400);
    this.riverBounds.push(rightRiver);
  }

  createBridges() {
    const bridgeX = this.mapWidth / 2;
    const bridgeY = this.mapHeight / 2;

    // Create main bridge platform
    const bridge = this.physics.add.sprite(bridgeX, bridgeY, 'bridge');
    bridge.setImmovable(true);
    
    // Create left rail with collision
    const leftRail = this.physics.add.sprite(bridgeX - 90, bridgeY, 'bridge_rail');
    leftRail.setImmovable(true);
    this.structures.push(leftRail);

    // Create right rail with collision
    const rightRail = this.physics.add.sprite(bridgeX + 90, bridgeY, 'bridge_rail');
    rightRail.setImmovable(true);
    this.structures.push(rightRail);
  }

  createStructures() {
    // Create various buildings and structures
    const buildingLocations = [
      // Northern dense cluster - moved away from bridge
      { x: 400, y: 200 }, { x: 600, y: 200 },
      { x: 1400, y: 200 }, { x: 1600, y: 200 },
      { x: 2200, y: 200 }, { x: 2400, y: 200 },
      { x: 3000, y: 200 }, { x: 3200, y: 200 },
      
      // Southern dense cluster - moved away from bridge
      { x: 400, y: 2800 }, { x: 600, y: 2800 },
      { x: 1400, y: 2800 }, { x: 1600, y: 2800 },
      { x: 2200, y: 2800 }, { x: 2400, y: 2800 },
      { x: 3000, y: 2800 }, { x: 3200, y: 2800 },

      // Mid-level clusters - moved away from bridge
      { x: 800, y: 800 }, { x: 1000, y: 800 },
      { x: 2800, y: 800 }, { x: 3000, y: 800 },
      { x: 800, y: 2200 }, { x: 1000, y: 2200 },
      { x: 2800, y: 2200 }, { x: 3000, y: 2200 }
    ];

    // Create buildings
    buildingLocations.forEach(({ x, y }) => {
      const building = this.physics.add.sprite(x, y, 'building');
      building.setScale(2);
      building.setImmovable(true);
      this.structures.push(building);
    });

    // Create some decorative walls - modified to avoid bridge
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x555555, 1);

    // Northern walls - avoid bridge area
    wallGraphics.fillRect(300, 100, 200, 20);
    wallGraphics.fillRect(700, 100, 200, 20);
    wallGraphics.fillRect(1300, 100, 200, 20);
    wallGraphics.fillRect(2500, 100, 200, 20);
    wallGraphics.fillRect(2900, 100, 200, 20);
    wallGraphics.fillRect(3300, 100, 200, 20);

    // Southern walls - avoid bridge area
    wallGraphics.fillRect(300, 2900, 200, 20);
    wallGraphics.fillRect(700, 2900, 200, 20);
    wallGraphics.fillRect(1300, 2900, 200, 20);
    wallGraphics.fillRect(2500, 2900, 200, 20);
    wallGraphics.fillRect(2900, 2900, 200, 20);
    wallGraphics.fillRect(3300, 2900, 200, 20);
  }

  createDenseEnvironment() {
    // Add small decorative structures
    const smallStructurePositions = [];
    
    // Generate random positions for small structures around buildings
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(100, this.mapWidth - 100);
      const y = Phaser.Math.Between(100, this.mapHeight - 100);
      
      // Avoid river area with a larger buffer
      if (Math.abs(y - this.mapHeight / 2) > 300) {
        smallStructurePositions.push({ x, y });
      }
    }

    smallStructurePositions.forEach(({ x, y }) => {
      const smallStructure = this.physics.add.sprite(x, y, 'small_structure');
      smallStructure.setImmovable(true);
      this.structures.push(smallStructure);
    });
  }

  createInteractables() {
    // Create different types of interactable objects spread across the larger map
    const interactableTypes = [
      // North area - well above river
      { x: 600, y: 300, type: 'portfolio' },
      { x: 1400, y: 300, type: 'about' },
      { x: 2400, y: 300, type: 'contact' },
      { x: 800, y: 800, type: 'projects' },
      { x: 2800, y: 800, type: 'skills' },
      
      // South area - well below river
      { x: 600, y: 2400, type: 'portfolio' },
      { x: 1400, y: 2400, type: 'about' },
      { x: 2400, y: 2400, type: 'contact' },
      { x: 800, y: 2800, type: 'projects' },
      { x: 2800, y: 2800, type: 'skills' },
      
      // Additional areas - away from river
      { x: 1000, y: 500, type: 'resume' },
      { x: 2800, y: 500, type: 'portfolio' },
      { x: 1000, y: 2600, type: 'resume' }
    ];

    interactableTypes.forEach(({ x, y, type }) => {
      const interactable = this.physics.add.sprite(x, y, 'interactable');
      interactable.setScale(2);
      interactable.setInteractive();
      interactable.type = type;
      interactable.setImmovable(true);
      this.interactables.push(interactable);
    });

    // Add collision between player and interactables
    this.physics.add.collider(this.player, this.interactables);
  }

  createMenuButton() {
    // Create a simple button in the bottom right
    const menuButton = this.add.text(
      this.cameras.main.width - 80,
      this.cameras.main.height - 80,
      'MENU',
      {
        fontSize: '24px',
        backgroundColor: '#2196F3',
        padding: { x: 15, y: 10 },
        fixedWidth: 80,
        align: 'center',
        color: '#ffffff'
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true });

    // Add click handler
    menuButton.on('pointerdown', () => {
      this.toggleMenu();
    });

    // Add hover effects
    menuButton.on('pointerover', () => {
      menuButton.setBackgroundColor('#42A5F5');
      menuButton.setScale(1.1);
    });

    menuButton.on('pointerout', () => {
      menuButton.setBackgroundColor('#2196F3');
      menuButton.setScale(1);
    });

    // Store reference
    this.menuButton = menuButton;

    // Update position on resize
    this.scale.on('resize', () => {
      menuButton.setPosition(
        this.cameras.main.width - 80,
        this.cameras.main.height - 80
      );
    });
  }

  toggleMenu() {
    console.log('Toggle menu called');
    if (this.isMenuOpen) {
      this.hideMenuOptions();
    } else {
      this.showMenuOptions();
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  showMenuOptions() {
    console.log('Showing menu options');
    
    // Clear any existing options
    if (this.menuOptions) {
      this.menuOptions.forEach(option => option.destroy());
    }
    
    const menuItems = [
      { text: 'Portfolio', scene: 'PortfolioScene' },
      { text: 'About', scene: 'AboutScene' },
      { text: 'Skills', scene: 'SkillsScene' },
      { text: 'Projects', scene: 'ProjectsScene' },
      { text: 'Contact', scene: 'ContactScene' }
    ];

    // Create menu options
    this.menuOptions = menuItems.map((item, index) => {
      const y = this.cameras.main.height - 160 - (index * 60);
      const option = this.add.text(
        this.cameras.main.width - 80,
        y,
        item.text,
        {
          fontSize: '20px',
          backgroundColor: '#FF4081',
          padding: { x: 15, y: 8 },
          fixedWidth: 120,
          align: 'center',
          color: '#ffffff'
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

      // Add click handler
      option.on('pointerdown', () => {
        console.log('Starting scene:', item.scene);
        this.scene.start(item.scene);
      });

      // Add hover effects
      option.on('pointerover', () => {
        option.setBackgroundColor('#FF6B9D');
        option.setScale(1.1);
      });

      option.on('pointerout', () => {
        option.setBackgroundColor('#FF4081');
        option.setScale(1);
      });

      // Animate in
      option.setAlpha(0);
      this.tweens.add({
        targets: option,
        alpha: 1,
        y: y,
        duration: 200,
        ease: 'Back.easeOut',
        delay: index * 50
      });

      return option;
    });
  }

  hideMenuOptions() {
    console.log('Hiding menu options');
    if (this.menuOptions) {
      this.menuOptions.forEach((option, index) => {
        this.tweens.add({
          targets: option,
          alpha: 0,
          y: '+=50',
          duration: 200,
          ease: 'Back.easeIn',
          delay: index * 50,
          onComplete: () => {
            option.destroy();
          }
        });
      });
      this.menuOptions = null;
    }
  }

  update() {
    if (!this.player) return;

    const speed = 400; // Increased speed for larger world

    let velocityX = 0;
    let velocityY = 0;

    // Handle horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
      this.facing = 'left';
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed;
      this.facing = 'right';
    }

    // Handle vertical movement
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
      this.facing = 'up';
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed;
      this.facing = 'down';
    }

    // Set player velocity
    this.player.setVelocity(velocityX, velocityY);

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      this.player.setVelocity(velocityX * 0.707, velocityY * 0.707);
    }
  }

  checkInteractables() {
    // We don't need this anymore since we're using the FAB menu
    // The menu is always accessible
  }
} 