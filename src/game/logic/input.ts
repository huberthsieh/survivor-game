import type Phaser from 'phaser'
import type { Vec2 } from './state'

/**
 * 根據鍵盤輸入獲取移動向量
 * @param keyBoard Phaser 的鍵盤輸入插件
 * @returns 正規化的移動向量
 */
export const getMoveVector = (keyBoard: Phaser.Input.Keyboard.KeyboardPlugin): Vec2 => {
  // 使用有意義的變數名稱來表示 WASD 按鍵
  const keyA = keyBoard.addKey('A') // 左移
  const keyD = keyBoard.addKey('D') // 右移
  const keyW = keyBoard.addKey('W') // 上移
  const keyS = keyBoard.addKey('S') // 下移

  // 方向鍵
  const cursorKeys = keyBoard.createCursorKeys()

  // 計算各方向的輸入狀態（0 或 1）
  const isMovingRight = Number(keyD.isDown || cursorKeys.right?.isDown)
  const isMovingLeft  = Number(keyA.isDown || cursorKeys.left?.isDown)
  const isMovingDown  = Number(keyS.isDown || cursorKeys.down?.isDown)
  const isMovingUp    = Number(keyW.isDown || cursorKeys.up?.isDown)

  // 計算最終的移動向量
  let moveX = isMovingRight - isMovingLeft
  let moveY = isMovingDown - isMovingUp

  // 正規化向量，確保斜向移動不會比直線移動快
  const vectorLength = Math.hypot(moveX, moveY) || 1

  return {
    x: moveX / vectorLength,
    y: moveY / vectorLength
  }
}