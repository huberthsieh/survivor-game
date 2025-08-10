import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    backgroundColor: '#1a1d29',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [GameScene],
  }
  const game = new Phaser.Game(config)
  return game
}
