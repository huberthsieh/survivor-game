export interface Position {
    x: number
    y: number
}

export interface Enemy extends Position {
    movementSpeed: number
}

/**
 * 計算敵人追蹤玩家的速度向量
 * @param enemyEntity 敵人實體 (包含位置和速度)
 * @param playerPosition 玩家位置
 * @returns 敵人朝向玩家的速度向量
 */
export const calculateSeekVelocity = (
    enemyEntity: Enemy,
    playerPosition: Position
) => {
    // 計算從敵人到玩家的方向向量
    const deltaX = playerPosition.x - enemyEntity.x
    const deltaY = playerPosition.y - enemyEntity.y

    // 計算距離，避免除零錯誤
    const distance = Math.hypot(deltaX, deltaY) || 1

    // 正規化方向向量並乘以敵人的速度
    const normalizedDirectionX = deltaX / distance
    const normalizedDirectionY = deltaY / distance

    return {
        x: normalizedDirectionX * enemyEntity.movementSpeed,
        y: normalizedDirectionY * enemyEntity.movementSpeed
    }
}