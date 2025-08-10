import type { GameCoreState, EnemyData, Vector2D } from './state'

// 全域敵人ID計數器
let globalEnemyIdCounter = 1

/**
 * 生成指定範圍內的隨機數
 * @param minimum 最小值
 * @param maximum 最大值
 * @returns 範圍內的隨機數
 */
const generateRandomNumber = (minimum: number, maximum: number): number => {
    return minimum + Math.random() * (maximum - minimum)
}

/**
 * 敵人生成決策結果
 */
export type EnemySpawnDecision =
    | {
    type: 'NO_SPAWN'
    nextSpawnTime: number
}
    | {
    type: 'SPAWN_ENEMY'
    nextSpawnTime: number
    enemyData: EnemyData
}

/**
 * 敵人速度配置
 */
interface EnemySpeedConfig {
    baseSpeed: number
    speedVariation: number
}

/**
 * 螢幕邊緣枚舉
 */
enum ScreenEdge {
    LEFT = 0,
    RIGHT = 1,
    TOP = 2,
    BOTTOM = 3
}

/**
 * 邊緣生成位置配置
 */
interface EdgeSpawnConfig {
    edgeOffset: number // 距離螢幕邊緣的偏移量
}

const DEFAULT_ENEMY_SPEED_CONFIG: EnemySpeedConfig = {
    baseSpeed: 80,
    speedVariation: 40
}

const DEFAULT_EDGE_SPAWN_CONFIG: EdgeSpawnConfig = {
    edgeOffset: 20
}

/**
 * 生成隨機敵人數據
 * @param speedConfig 速度配置
 * @returns 新的敵人數據
 */
const createRandomEnemyData = (
    speedConfig: EnemySpeedConfig = DEFAULT_ENEMY_SPEED_CONFIG
): EnemyData => {
    const randomSpeed = speedConfig.baseSpeed + Math.random() * speedConfig.speedVariation

    return {
        id: globalEnemyIdCounter++,
        movementSpeed: randomSpeed
    }
}

/**
 * 判斷是否應該生成新敵人
 * @param currentTime 當前遊戲時間
 * @param gameState 當前遊戲狀態
 * @param speedConfig 敵人速度配置（可選）
 * @returns 生成決策結果
 */
export const determineEnemySpawn = (
    currentTime: number,
    gameState: GameCoreState,
    speedConfig?: EnemySpeedConfig
): EnemySpawnDecision => {
    const {activeEnemies, spawnConfig} = gameState

    // 檢查是否達到最大敵人數量限制
    if (activeEnemies.length >= spawnConfig.maximumEnemies) {
        return {
            type: 'NO_SPAWN',
            nextSpawnTime: spawnConfig.lastSpawnTime
        }
    }

    // 檢查是否到了生成時間
    if (currentTime >= spawnConfig.lastSpawnTime) {
        const newEnemyData = createRandomEnemyData(speedConfig)
        const nextSpawnTime = currentTime + spawnConfig.spawnInterval

        return {
            type: 'SPAWN_ENEMY',
            nextSpawnTime,
            enemyData: newEnemyData
        }
    }

    // 還沒到生成時間
    return {
        type: 'NO_SPAWN',
        nextSpawnTime: spawnConfig.lastSpawnTime
    }
}

/**
 * 在螢幕邊緣隨機位置生成敵人
 * @param screenWidth 螢幕寬度
 * @param screenHeight 螢幕高度
 * @param spawnConfig 邊緣生成配置（可選）
 * @returns 隨機邊緣位置座標
 */
export const generateRandomEdgePosition = (
    screenWidth: number,
    screenHeight: number,
    spawnConfig: EdgeSpawnConfig = DEFAULT_EDGE_SPAWN_CONFIG
): Vector2D => {
    const {edgeOffset} = spawnConfig
    const randomEdge = Math.floor(generateRandomNumber(0, 4)) as ScreenEdge

    // 邊緣位置生成映射表
    const edgePositionGenerators = new Map<ScreenEdge, () => Vector2D>([
        [ScreenEdge.LEFT, () => ({
            x: -edgeOffset,
            y: generateRandomNumber(0, screenHeight)
        })],
        [ScreenEdge.RIGHT, () => ({
            x: screenWidth + edgeOffset,
            y: generateRandomNumber(0, screenHeight)
        })],
        [ScreenEdge.TOP, () => ({
            x: generateRandomNumber(0, screenWidth),
            y: -edgeOffset
        })],
        [ScreenEdge.BOTTOM, () => ({
            x: generateRandomNumber(0, screenWidth),
            y: screenHeight + edgeOffset
        })]
    ])

    const positionGenerator = edgePositionGenerators.get(randomEdge)

    if (!positionGenerator) {
        console.warn(`Invalid edge value: ${randomEdge}`)
        // 預設返回左邊緣位置
        return {
            x: -edgeOffset,
            y: generateRandomNumber(0, screenHeight)
        }
    }

    return positionGenerator()
}

/**
 * 重置敵人ID計數器（主要用於測試或遊戲重新開始）
 * @param startId 起始ID，預設為1
 */
export const resetEnemyIdCounter = (startId: number = 1): void => {
    globalEnemyIdCounter = startId
}

// 為了向後相容，保留舊的函數名稱
export const shouldSpawn = determineEnemySpawn
export const randomEdgePosition = generateRandomEdgePosition
export type SpawnDecision = EnemySpawnDecision