import Phaser from 'phaser';
import { MenuScene } from './MenuScene.js';
import { BattleScene } from './BattleScene.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 710,
  backgroundColor: '#0a0e27',
  parent: 'game-container',
  scene: [MenuScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
