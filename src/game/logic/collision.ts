import type { EnemyData } from './state'

/**
 * 碰撞事件結果類型
 * 定義玩家與敵人碰撞後可能產生的各種結果
 */
export type CollisionEventResult =
    | {
  type: 'PLAYER_DAMAGED'
  damageAmount: number
  sourceEnemyId: number
}
    | {
  type: 'ENEMY_DESTROYED'
  destroyedEnemyId: number
  scorePoints?: number
}
    | {
  type: 'KNOCKBACK_APPLIED'
  targetEnemyId: number
  knockbackForce: number
}

/**
 * 碰撞配置參數
 */
interface CollisionConfig {
  playerDamagePerHit: number
  playerInvulnerabilityTime: number // 玩家受傷後的無敵時間
  enemyKnockbackChance: number // 敵人被擊退的機率 (0-1)
  knockbackForce: number
}

/**
 * 碰撞狀態追蹤
 */
interface CollisionState {
  lastPlayerHitTime: number
  recentlyHitEnemies: Set<number> // 追蹤最近碰撞過的敵人ID
}

// 預設碰撞配置
const DEFAULT_COLLISION_CONFIG: CollisionConfig = {
  playerDamagePerHit: 10,
  playerInvulnerabilityTime: 0.5, // 500毫秒無敵時間
  enemyKnockbackChance: 0.1, // 10% 機率擊退敵人
  knockbackForce: 150
}

// 全域碰撞狀態
let globalCollisionState: CollisionState = {
  lastPlayerHitTime: 0,
  recentlyHitEnemies: new Set()
}

/**
 * 檢查玩家是否處於無敵狀態
 * @param currentTime 當前遊戲時間
 * @param config 碰撞配置
 * @returns 是否處於無敵狀態
 */
const isPlayerInvulnerable = (
    currentTime: number,
    config: CollisionConfig = DEFAULT_COLLISION_CONFIG
): boolean => {
  const timeSinceLastHit = currentTime - globalCollisionState.lastPlayerHitTime
  return timeSinceLastHit < config.playerInvulnerabilityTime
}

/**
 * 檢查是否應該對敵人施加擊退效果
 * @param config 碰撞配置
 * @returns 是否應該擊退
 */
const shouldApplyKnockback = (
    config: CollisionConfig = DEFAULT_COLLISION_CONFIG
): boolean => {
  return Math.random() < config.enemyKnockbackChance
}

/**
 * 處理玩家與單個敵人的碰撞
 * @param enemyData 碰撞的敵人數據
 * @param currentTime 當前遊戲時間
 * @param config 碰撞配置（可選）
 * @returns 碰撞結果陣列
 */
export const processPlayerEnemyCollision = (
    enemyData: EnemyData,
    currentTime: number,
    config: CollisionConfig = DEFAULT_COLLISION_CONFIG
): CollisionEventResult[] => {
  const collisionResults: CollisionEventResult[] = []

  // 檢查玩家是否處於無敵狀態
  if (isPlayerInvulnerable(currentTime, config)) {
    return collisionResults // 無敵狀態下不產生任何效果
  }

  // 檢查是否已經與此敵人碰撞過（避免重複傷害）
  if (globalCollisionState.recentlyHitEnemies.has(enemyData.id)) {
    return collisionResults
  }

  // 玩家受到傷害
  collisionResults.push({
    type: 'PLAYER_DAMAGED',
    damageAmount: config.playerDamagePerHit,
    sourceEnemyId: enemyData.id
  })

  // 更新碰撞狀態
  globalCollisionState.lastPlayerHitTime = currentTime
  globalCollisionState.recentlyHitEnemies.add(enemyData.id)

  // 檢查是否觸發擊退效果
  if (shouldApplyKnockback(config)) {
    collisionResults.push({
      type: 'KNOCKBACK_APPLIED',
      targetEnemyId: enemyData.id,
      knockbackForce: config.knockbackForce
    })
  }

  return collisionResults
}

/**
 * 處理玩家與多個敵人的碰撞（批量處理）
 * @param collidingEnemies 碰撞的敵人陣列
 * @param currentTime 當前遊戲時間
 * @param config 碰撞配置（可選）
 * @returns 所有碰撞結果
 */
export const processMultipleEnemyCollisions = (
    collidingEnemies: EnemyData[],
    currentTime: number,
    config: CollisionConfig = DEFAULT_COLLISION_CONFIG
): CollisionEventResult[] => {
  const allResults: CollisionEventResult[] = []

  for (const enemy of collidingEnemies) {
    const results = processPlayerEnemyCollision(enemy, currentTime, config)
    allResults.push(...results)
  }

  return allResults
}

/**
 * 重置碰撞狀態（用於遊戲重新開始或關卡切換）
 */
export const resetCollisionState = (): void => {
  globalCollisionState = {
    lastPlayerHitTime: 0,
    recentlyHitEnemies: new Set()
  }
}

/**
 * 清理最近碰撞的敵人列表（定期呼叫以避免記憶體洩漏）
 * @param currentTime 當前遊戲時間
 * @param cleanupThreshold 清理閾值（秒）
 */
export const cleanupRecentCollisions = (
    currentTime: number,
    cleanupThreshold: number = 2.0
): void => {
  // 如果距離上次碰撞超過閾值，清空最近碰撞列表
  if (currentTime - globalCollisionState.lastPlayerHitTime > cleanupThreshold) {
    globalCollisionState.recentlyHitEnemies.clear()
  }
}

/**
 * 獲取當前碰撞配置（用於調試或UI顯示）
 * @returns 當前使用的碰撞配置
 */
export const getCurrentCollisionConfig = (): CollisionConfig => {
  return { ...DEFAULT_COLLISION_CONFIG }
}

// 為了向後相容，保留簡化版本的函數
export const onPlayerEnemyOverlap = (): CollisionEventResult[] => {
  return [{
    type: 'PLAYER_DAMAGED',
    damageAmount: 10,
    sourceEnemyId: -1 // 未知敵人ID
  }]
}

// 型別別名，向後相容
export type CollisionOutcome = CollisionEventResult