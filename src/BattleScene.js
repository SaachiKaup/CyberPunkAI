import Phaser from 'phaser';
import { MONSTERS, createMonster, getRandomPersonality, generateAIMonster } from './MonsterData.js';
import { AIOpponent } from './AIOpponent.js';
import { ThreeBackground } from './ThreeBackground.js';
import { SpriteGenerator } from './SpriteGenerator.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.aiOpponent = new AIOpponent();
  }

  init(data) {
    this.playerMonsterType = data.playerMonster || 'STRIKER';
    this.opponentMonsterType = data.opponentMonster || 'TANK';
  }

  async create() {
    // Show loading text
    const loadingText = this.add.text(450, 350, 'Generating AI Opponent...', {
      fontSize: '36px',
      fontFamily: 'Orbitron',
      color: '#00ffff'
    }).setOrigin(0.5);

    // Initialize game state - Generate AI opponent
    this.playerMonster = createMonster(this.playerMonsterType);

    // Try to generate AI opponent, fallback to template if it fails
    const aiOpponentData = await generateAIMonster(this.opponentMonsterType);
    this.opponentMonster = {
      ...aiOpponentData,
      hp: aiOpponentData.maxHP,
      activeBlock: 0,
      stunned: false
    };

    this.opponentPersonality = getRandomPersonality();

    // Remove loading text
    loadingText.destroy();

    this.roundsWon = { player: 0, opponent: 0 };
    this.turnNumber = 0;
    this.cooldowns = { player: {}, opponent: {} };
    this.playerLastMove = null;
    this.isPlayerTurn = true;
    this.waitingForAnimation = false;

    // Setup UI
    this.setupBackground();
    this.setupMonsters();
    this.setupHealthBars();
    this.setupNarrationBox();
    this.setupAbilityButtons();
    this.setupRoundCounter();

    // Show battle intro
    this.showBattleIntro();
  }

  setupBackground() {
    // Create Three.js canvas for background
    const threeCanvas = document.createElement('canvas');
    threeCanvas.id = 'three-background';
    threeCanvas.style.position = 'fixed';
    threeCanvas.style.top = '0';
    threeCanvas.style.left = '0';
    threeCanvas.style.width = '100vw';
    threeCanvas.style.height = '100vh';
    threeCanvas.style.zIndex = '0';

    // Insert at beginning of body
    document.body.insertBefore(threeCanvas, document.body.firstChild);

    // Make sure Phaser canvas is positioned correctly
    const gameCanvas = this.game.canvas;
    gameCanvas.style.position = 'relative';
    gameCanvas.style.zIndex = '1';

    // Initialize Three.js background with full window size
    this.threeBackground = new ThreeBackground(threeCanvas);

    // Add semi-transparent overlay for better text visibility
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0e27, 0.3);
    overlay.fillRect(0, 0, 900, 700);

    // Battle platform with neon edges
    const platform = this.add.graphics();
    platform.fillStyle(0x1a1a3e, 0.5);
    platform.fillRect(100, 550, 700, 10);
    platform.lineStyle(3, 0xff00ff, 0.8);
    platform.strokeRect(100, 550, 700, 10);

    // Add glowing platform effect
    const platformGlow = this.add.rectangle(450, 555, 700, 10, 0xff00ff, 0.2);
    this.tweens.add({
      targets: platformGlow,
      alpha: 0.4,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Title with cyberpunk style
    this.add.text(450, 35, 'PROMPT BATTLE ARENA', {
      fontSize: '48px',
      fontFamily: 'Orbitron',
      fontStyle: '900',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  setupMonsters() {
    // Generate sprite textures
    const playerSpriteKey = SpriteGenerator.generateMonsterSprite(this, this.playerMonster.type, 128);
    const opponentSpriteKey = SpriteGenerator.generateMonsterSprite(this, this.opponentMonster.type, 128);

    // Player monster (left side) - Sprite-based
    this.playerSprite = this.add.sprite(230, 280, playerSpriteKey);
    this.playerSprite.setScale(2);
    this.playerSprite.setTint(0xffffff);

    // Add glow effect to player
    const playerGlow = this.add.sprite(230, 280, playerSpriteKey);
    playerGlow.setScale(2.2);
    playerGlow.setTint(this.playerMonster.color);
    playerGlow.setAlpha(0.3);
    playerGlow.setDepth(-1);

    // Opponent monster (right side) - Sprite-based
    this.opponentSprite = this.add.sprite(670, 280, opponentSpriteKey);
    this.opponentSprite.setScale(2);
    this.opponentSprite.setFlipX(true);
    this.opponentSprite.setTint(0xffffff);

    // Add glow effect to opponent
    const opponentGlow = this.add.sprite(670, 280, opponentSpriteKey);
    opponentGlow.setScale(2.2);
    opponentGlow.setFlipX(true);
    opponentGlow.setTint(this.opponentMonster.color);
    opponentGlow.setAlpha(0.3);
    opponentGlow.setDepth(-1);

    // Store glow references for animations
    this.playerGlow = playerGlow;
    this.opponentGlow = opponentGlow;

    // Idle animation - floating effect
    this.tweens.add({
      targets: [this.playerSprite, playerGlow],
      y: '+=10',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: [this.opponentSprite, opponentGlow],
      y: '+=10',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 750
    });

    // Labels
    const playerLabelText = `Your ${this.playerMonster.type}`;
    this.playerLabel = this.add.text(230, 380, playerLabelText, {
      fontSize: '22px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const opponentLabelText = `${this.opponentMonster.name}${this.opponentMonster.aiGenerated ? ' ✨' : ''}`;
    this.opponentLabel = this.add.text(670, 380, opponentLabelText, {
      fontSize: '22px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: this.opponentMonster.aiGenerated ? '#ffaa00' : '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // VS text - Cyberpunk style
    const vsText = this.add.text(450, 280, 'VS', {
      fontSize: '64px',
      fontFamily: 'Orbitron',
      fontStyle: '900',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Add pulsing glow to VS text
    this.tweens.add({
      targets: vsText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }


  setupHealthBars() {
    // Player health bar - cyberpunk style
    this.playerHealthBarBg = this.add.rectangle(230, 410, 220, 26, 0x1a1a3e).setOrigin(0.5);
    this.playerHealthBarBg.setStrokeStyle(2, 0x00ffff, 0.8);
    this.playerHealthBar = this.add.rectangle(230, 410, 220, 26, 0x00ffff).setOrigin(0.5);
    this.playerHealthText = this.add.text(230, 410, `${this.playerMonster.hp}/${this.playerMonster.maxHP}`, {
      fontSize: '20px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#000000'
    }).setOrigin(0.5);

    // Opponent health bar - cyberpunk style
    this.opponentHealthBarBg = this.add.rectangle(670, 410, 220, 26, 0x1a1a3e).setOrigin(0.5);
    this.opponentHealthBarBg.setStrokeStyle(2, 0xff00ff, 0.8);
    this.opponentHealthBar = this.add.rectangle(670, 410, 220, 26, 0x00ffff).setOrigin(0.5);
    this.opponentHealthText = this.add.text(670, 410, `${this.opponentMonster.hp}/${this.opponentMonster.maxHP}`, {
      fontSize: '20px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#000000'
    }).setOrigin(0.5);
  }

  setupNarrationBox() {
    // Narration background - cyberpunk style
    this.narrationBg = this.add.rectangle(450, 490, 850, 90, 0x0a0e27).setOrigin(0.5);
    this.narrationBg.setStrokeStyle(3, 0x00ffff, 0.8);

    // Add inner glow
    const innerGlow = this.add.rectangle(450, 490, 845, 85, 0x00ffff, 0.1).setOrigin(0.5);

    this.narrationText = this.add.text(450, 490, '', {
      fontSize: '22px',
      fontFamily: 'Orbitron',
      color: '#00ffff',
      align: 'center',
      wordWrap: { width: 820 }
    }).setOrigin(0.5);
  }

  setupAbilityButtons() {
    this.abilityButtons = [];

    this.playerMonster.abilities.forEach((ability, index) => {
      const x = 280 + (index * 340);
      const y = 610;

      // Button background - cyberpunk style
      const button = this.add.rectangle(x, y, 320, 85, 0x1a1a3e)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x00ffff, 0.9);

      // Button glow
      const buttonGlow = this.add.rectangle(x, y, 315, 80, 0x00ffff, 0.1).setOrigin(0.5);

      // Button text
      const text = this.add.text(x, y - 12, ability.name, {
        fontSize: '24px',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        color: '#00ffff'
      }).setOrigin(0.5);

      const desc = this.add.text(x, y + 12, ability.description, {
        fontSize: '17px',
        fontFamily: 'Orbitron',
        color: '#ff00ff'
      }).setOrigin(0.5);

      const cooldownText = this.add.text(x, y + 30, '', {
        fontSize: '15px',
        fontFamily: 'Orbitron',
        color: '#ff6666'
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.onAbilityClick(ability, index));
      button.on('pointerover', () => {
        button.setFillStyle(0x2a2a5e);
        button.setStrokeStyle(3, 0xff00ff, 1);
      });
      button.on('pointerout', () => {
        if (!this.cooldowns.player[ability.id]) {
          button.setFillStyle(0x1a1a3e);
          button.setStrokeStyle(3, 0x00ffff, 0.9);
        }
      });

      this.abilityButtons.push({ button, text, desc, cooldownText, ability });
    });
  }

  setupRoundCounter() {
    this.roundText = this.add.text(450, 95, 'Round 1 - First to 2 wins!', {
      fontSize: '26px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#ff00ff',
      stroke: '#00ffff',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  showBattleIntro() {
    const intro = this.aiOpponent.generateBattleIntro(this.opponentMonster, this.opponentPersonality);
    this.narrationText.setText(intro);
  }

  onAbilityClick(ability, index) {
    if (this.waitingForAnimation || !this.isPlayerTurn) return;
    if (this.cooldowns.player[ability.id] && this.cooldowns.player[ability.id] > 0) return;

    this.waitingForAnimation = true;
    this.playerLastMove = ability.name;

    // Execute player's move
    this.executeMove(this.playerMonster, this.opponentMonster, ability, true);

    // Set cooldown
    this.cooldowns.player[ability.id] = ability.cooldown;

    // After animation, check if round is over
    this.time.delayedCall(1000, () => {
      if (this.checkRoundEnd()) return;

      // Opponent's turn
      this.isPlayerTurn = false;
      this.executeOpponentTurn();
    });
  }

  async executeOpponentTurn() {
    this.turnNumber++;

    // Decrease cooldowns
    for (let key in this.cooldowns.opponent) {
      if (this.cooldowns.opponent[key] > 0) {
        this.cooldowns.opponent[key]--;
      }
    }

    // Get AI decision
    const context = {
      opponentMonster: this.opponentMonster,
      playerMonster: this.playerMonster,
      personality: this.opponentPersonality,
      availableAbilities: this.opponentMonster.abilities,
      cooldowns: this.cooldowns.opponent,
      playerLastMove: this.playerLastMove,
      turnNumber: this.turnNumber
    };

    const aiDecision = await this.aiOpponent.getMove(context);

    // Show narration
    this.narrationText.setText(aiDecision.narration);

    // Execute opponent's move
    this.time.delayedCall(800, () => {
      this.executeMove(this.opponentMonster, this.playerMonster, aiDecision.ability, false);

      // Set cooldown
      this.cooldowns.opponent[aiDecision.ability.id] = aiDecision.ability.cooldown;

      this.time.delayedCall(1000, () => {
        if (this.checkRoundEnd()) return;

        // Back to player turn
        this.isPlayerTurn = true;
        this.waitingForAnimation = false;

        // Decrease player cooldowns
        for (let key in this.cooldowns.player) {
          if (this.cooldowns.player[key] > 0) {
            this.cooldowns.player[key]--;
          }
        }

        this.updateAbilityButtons();
      });
    });
  }

  executeMove(attacker, defender, ability, isPlayer) {
    const attackerSprite = isPlayer ? this.playerSprite : this.opponentSprite;
    const attackerGlow = isPlayer ? this.playerGlow : this.opponentGlow;
    const defenderSprite = isPlayer ? this.opponentSprite : this.playerSprite;
    const defenderGlow = isPlayer ? this.opponentGlow : this.playerGlow;

    // Attack animation - lunge forward
    this.tweens.add({
      targets: [attackerSprite, attackerGlow],
      x: isPlayer ? '+=80' : '-=80',
      duration: 150,
      yoyo: true,
      ease: 'Power2',
      onStart: () => {
        // Scale up for attack
        this.tweens.add({
          targets: attackerSprite,
          scaleX: 2.2,
          scaleY: 2.2,
          duration: 150,
          yoyo: true
        });
      }
    });

    this.time.delayedCall(150, () => {
      if (ability.type === 'DEFENSIVE' && ability.block) {
        // Apply shield
        attacker.activeBlock = ability.block;
        this.flashSprite(attackerSprite, attackerGlow, 0x4444ff);
      } else {
        // Apply damage
        let damage = ability.damage || 0;

        // Check if defender has active block
        if (defender.activeBlock > 0) {
          const blocked = Math.min(damage, defender.activeBlock);
          damage -= blocked;
          defender.activeBlock -= blocked;
        }

        defender.hp = Math.max(0, defender.hp - damage);
        this.flashSprite(defenderSprite, defenderGlow, 0xff4444);

        // Shake defender
        this.tweens.add({
          targets: [defenderSprite, defenderGlow],
          x: '+=10',
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }

      this.updateHealthBars();
    });
  }

  flashSprite(sprite, glow, color) {
    const originalTint = sprite.tintTopLeft;
    sprite.setTint(color);
    glow.setTint(color);
    glow.setAlpha(0.6);

    this.time.delayedCall(200, () => {
      sprite.setTint(0xffffff);
      glow.setTint(sprite === this.playerSprite ? this.playerMonster.color : this.opponentMonster.color);
      glow.setAlpha(0.3);
    });
  }

  updateHealthBars() {
    // Player health
    const playerPercent = this.playerMonster.hp / this.playerMonster.maxHP;
    this.playerHealthBar.setScale(playerPercent, 1);
    this.playerHealthBar.x = 230 - (220 * (1 - playerPercent) / 2);
    this.playerHealthText.setText(`${this.playerMonster.hp}/${this.playerMonster.maxHP}`);

    // Color gradient
    const playerColor = this.getHealthColor(playerPercent);
    this.playerHealthBar.setFillStyle(playerColor);

    // Opponent health
    const opponentPercent = this.opponentMonster.hp / this.opponentMonster.maxHP;
    this.opponentHealthBar.setScale(opponentPercent, 1);
    this.opponentHealthBar.x = 670 - (220 * (1 - opponentPercent) / 2);
    this.opponentHealthText.setText(`${this.opponentMonster.hp}/${this.opponentMonster.maxHP}`);

    const opponentColor = this.getHealthColor(opponentPercent);
    this.opponentHealthBar.setFillStyle(opponentColor);
  }

  getHealthColor(percent) {
    if (percent > 0.6) return 0x00ffff; // Cyan - high health
    if (percent > 0.3) return 0xff00ff; // Magenta - medium health
    return 0xff0066; // Hot pink - low health
  }

  updateAbilityButtons() {
    this.abilityButtons.forEach(({ button, cooldownText, ability }) => {
      const cooldown = this.cooldowns.player[ability.id] || 0;

      if (cooldown > 0) {
        button.setFillStyle(0x555555);
        cooldownText.setText(`Cooldown: ${cooldown} turn${cooldown > 1 ? 's' : ''}`);
      } else {
        button.setFillStyle(0x3a3a5e);
        cooldownText.setText('Ready');
      }
    });
  }

  checkRoundEnd() {
    if (this.playerMonster.hp <= 0 || this.opponentMonster.hp <= 0) {
      const winner = this.playerMonster.hp > 0 ? 'player' : 'opponent';
      this.endRound(winner);
      return true;
    }
    return false;
  }

  endRound(winner) {
    this.roundsWon[winner]++;

    const winnerName = winner === 'player' ? `Your ${this.playerMonster.type}` : this.opponentMonster.name;
    this.narrationText.setText(`${winnerName} wins this round!`);

    this.roundText.setText(`Rounds Won - You: ${this.roundsWon.player} | ${this.opponentMonster.name}: ${this.roundsWon.opponent}`);

    // Victory animation
    const winnerSprite = winner === 'player' ? this.playerSprite : this.opponentSprite;
    this.tweens.add({
      targets: winnerSprite,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      repeat: 2
    });

    // Check if battle is over (best of 3)
    if (this.roundsWon.player === 2 || this.roundsWon.opponent === 2) {
      this.time.delayedCall(2000, () => this.endBattle(winner));
    } else {
      // Reset for next round
      this.time.delayedCall(2000, () => this.resetRound());
    }
  }

  resetRound() {
    this.playerMonster.hp = this.playerMonster.maxHP;
    this.opponentMonster.hp = this.opponentMonster.maxHP;
    this.playerMonster.activeBlock = 0;
    this.opponentMonster.activeBlock = 0;
    this.cooldowns = { player: {}, opponent: {} };
    this.isPlayerTurn = true;
    this.waitingForAnimation = false;
    this.playerLastMove = null;

    this.updateHealthBars();
    this.updateAbilityButtons();
    this.narrationText.setText('Next round begins!');
  }

  endBattle(winner) {
    const summary = this.aiOpponent.generateBattleSummary(
      winner,
      this.opponentPersonality,
      this.playerMonster,
      this.opponentMonster
    );

    // Create victory/defeat screen - cyberpunk style
    const overlay = this.add.rectangle(450, 350, 900, 700, 0x0a0e27, 0.95);

    const resultText = winner === 'player' ? 'VICTORY!' : 'DEFEAT!';
    const resultColor = winner === 'player' ? '#00ff00' : '#ff0000';
    const resultGlow = winner === 'player' ? '#00ffff' : '#ff00ff';

    const mainText = this.add.text(450, 220, resultText, {
      fontSize: '84px',
      fontFamily: 'Orbitron',
      fontStyle: '900',
      color: resultColor,
      stroke: resultGlow,
      strokeThickness: 8
    }).setOrigin(0.5);

    // Add pulsing effect to result text
    this.tweens.add({
      targets: mainText,
      scale: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.add.text(450, 320, summary, {
      fontSize: '24px',
      fontFamily: 'Orbitron',
      color: '#00ffff',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);

    // Play Again button - cyberpunk style
    const playAgainBtn = this.add.rectangle(450, 430, 220, 55, 0x1a1a3e)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0x00ffff, 0.9);

    this.add.rectangle(450, 430, 215, 50, 0x00ffff, 0.1);

    this.add.text(450, 430, 'Play Again', {
      fontSize: '26px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#00ffff'
    }).setOrigin(0.5);

    playAgainBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setFillStyle(0x2a2a5e);
      playAgainBtn.setStrokeStyle(3, 0xff00ff, 1);
    });
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setFillStyle(0x1a1a3e);
      playAgainBtn.setStrokeStyle(3, 0x00ffff, 0.9);
    });

    // Main Menu button - cyberpunk style
    const menuBtn = this.add.rectangle(450, 510, 220, 55, 0x1a1a3e)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xff00ff, 0.9);

    this.add.rectangle(450, 510, 215, 50, 0xff00ff, 0.1);

    this.add.text(450, 510, 'Main Menu', {
      fontSize: '26px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      color: '#ff00ff'
    }).setOrigin(0.5);

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    menuBtn.on('pointerover', () => {
      menuBtn.setFillStyle(0x2a2a5e);
      menuBtn.setStrokeStyle(3, 0x00ffff, 1);
    });
    menuBtn.on('pointerout', () => {
      menuBtn.setFillStyle(0x1a1a3e);
      menuBtn.setStrokeStyle(3, 0xff00ff, 0.9);
    });
  }

  shutdown() {
    // Clean up Three.js background
    if (this.threeBackground) {
      this.threeBackground.destroy();
      const threeCanvas = document.getElementById('three-background');
      if (threeCanvas) {
        threeCanvas.remove();
      }
    }
  }
}
