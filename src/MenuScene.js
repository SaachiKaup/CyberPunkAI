import Phaser from 'phaser';
import { MONSTERS } from './MonsterData.js';
import { SpriteGenerator } from './SpriteGenerator.js';
import { ThreeBackground } from './ThreeBackground.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Setup Three.js background
    this.setupBackground();

    // Semi-transparent overlay for better text readability
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0e27, 0.3);
    graphics.fillRect(0, 0, 900, 710);

    // Add cyberpunk grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ffff, 0.15);
    for (let i = 0; i < 900; i += 60) {
      grid.lineBetween(i, 0, i, 710);
    }
    for (let i = 0; i < 710; i += 60) {
      grid.lineBetween(0, i, 900, i);
    }

    // Neon lines
    this.add.rectangle(0, 80, 900, 2, 0xff00ff, 0.8);
    this.add.rectangle(0, 680, 900, 2, 0x00ffff, 0.8);

    // Cyberpunk city silhouette
    const buildings = this.add.graphics();
    buildings.fillStyle(0x0a0a1a, 0.5);
    buildings.fillRect(30, 500, 100, 200);
    buildings.fillRect(150, 480, 80, 220);
    buildings.fillRect(750, 490, 120, 210);

    // Neon windows
    const windows = this.add.graphics();
    windows.fillStyle(0x00ffff, 0.9);
    for (let i = 0; i < 8; i++) {
      windows.fillRect(40 + (i % 3) * 25, 520 + Math.floor(i / 3) * 35, 10, 15);
      windows.fillRect(760 + (i % 4) * 25, 510 + Math.floor(i / 4) * 40, 10, 15);
    }
    windows.fillStyle(0xff00ff, 0.9);
    for (let i = 0; i < 6; i++) {
      windows.fillRect(160 + (i % 2) * 25, 500 + Math.floor(i / 2) * 35, 10, 15);
    }

    // Title with cyberpunk glow
    const titleText = this.add.text(450, 110, 'PROMPT BATTLE ARENA', {
      fontSize: '52px',
      fontFamily: 'Orbitron',
      fontStyle: '900',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle with pulsing effect
    const subtitle = this.add.text(450, 180, 'AI-Powered Monster Combat', {
      fontSize: '22px',
      fontFamily: 'Orbitron',
      color: '#ff00ff',
      stroke: '#00ffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: subtitle,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Instructions
    this.add.text(450, 250, 'Choose Your Monster:', {
      fontSize: '26px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Monster selection buttons
    const monsterTypes = ['STRIKER', 'TANK', 'SPEEDSTER'];
    const startX = 170;
    const spacing = 265;

    monsterTypes.forEach((type, index) => {
      const monster = MONSTERS[type];
      const x = startX + (index * spacing);
      const y = 430;

      // Create pixel art sprite for menu
      const spriteKey = SpriteGenerator.generateMonsterSprite(this, type, 128);
      const sprite = this.add.sprite(x, y - 40, spriteKey);
      sprite.setScale(1.8);

      // Add glow effect
      const glow = this.add.sprite(x, y - 40, spriteKey);
      glow.setScale(2.0);
      glow.setTint(monster.color);
      glow.setAlpha(0.3);
      glow.setDepth(-1);

      // Floating animation
      this.tweens.add({
        targets: [sprite, glow],
        y: '-=12',
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Monster name with cyberpunk style
      this.add.text(x, y + 65, type, {
        fontSize: '20px',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        color: '#00ffff',
        stroke: '#ff00ff',
        strokeThickness: 2
      }).setOrigin(0.5);

      // Stats with neon glow
      this.add.text(x, y + 92, `HP: ${monster.maxHP}`, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#ff00ff'
      }).setOrigin(0.5);

      // Abilities
      const abilities = monster.abilities.map(a => a.name).join('\n');
      this.add.text(x, y + 125, abilities, {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#00ffff',
        align: 'center'
      }).setOrigin(0.5);

      // Select button - cyberpunk style
      const button = this.add.rectangle(x, y + 180, 200, 50, 0x1a1a3e)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x00ffff, 0.9);

      // Button glow
      this.add.rectangle(x, y + 180, 195, 45, 0x00ffff, 0.1);

      const buttonText = this.add.text(x, y + 180, 'SELECT', {
        fontSize: '20px',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        color: '#00ffff'
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.startBattle(type));
      button.on('pointerover', () => {
        button.setFillStyle(0x2a2a5e);
        button.setStrokeStyle(3, 0xff00ff, 1);
      });
      button.on('pointerout', () => {
        button.setFillStyle(0x1a1a3e);
        button.setStrokeStyle(3, 0x00ffff, 0.9);
      });
    });

    // Game info with cyberpunk colors
    this.add.text(450, 650, 'Best of 3 Rounds • AI-Generated Opponents', {
      fontSize: '22px',
      fontFamily: 'Orbitron',
      color: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);

    // Credits
    this.add.text(450, 685, 'Built with DigitalOcean Gradient AI Platform & Phaser 3', {
      fontSize: '16px',
      fontFamily: 'Orbitron',
      color: '#ff00ff'
    }).setOrigin(0.5);
  }

  setupBackground() {
    // Create or reuse Three.js background canvas
    let threeCanvas = document.getElementById('three-background');

    if (!threeCanvas) {
      threeCanvas = document.createElement('canvas');
      threeCanvas.id = 'three-background';
      threeCanvas.style.position = 'fixed';
      threeCanvas.style.top = '0';
      threeCanvas.style.left = '0';
      threeCanvas.style.width = '100vw';
      threeCanvas.style.height = '100vh';
      threeCanvas.style.zIndex = '0';
      document.body.insertBefore(threeCanvas, document.body.firstChild);
    }

    this.threeBackground = new ThreeBackground(threeCanvas);
  }

  startBattle(playerMonster) {
    // Randomly select opponent monster (different from player's choice)
    const monsterTypes = ['STRIKER', 'TANK', 'SPEEDSTER'];
    const availableOpponents = monsterTypes.filter(type => type !== playerMonster);
    const opponentMonster = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];

    this.scene.start('BattleScene', {
      playerMonster: playerMonster,
      opponentMonster: opponentMonster
    });
  }

  shutdown() {
    // Clean up Three.js background when leaving menu
    if (this.threeBackground) {
      this.threeBackground.destroy();
      this.threeBackground = null;
    }
  }
}
