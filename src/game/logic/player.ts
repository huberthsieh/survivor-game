import type { Vec2 } from './state'

/**
 * 將方向向量轉換為實際的移動速度向量
 * @param direction 正規化的方向向量 (-1 到 1 之間)
 * @param movementSpeed 移動速度 (像素/秒)
 * @returns 實際的速度向量
 */
export const calculateVelocityFromInput = (
    direction: Vec2,
    movementSpeed: number = 200
): Vec2 => ({
    x: direction.x * movementSpeed,
    y: direction.y * movementSpeed,
})