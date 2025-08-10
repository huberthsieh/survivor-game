export interface Vector2D {
  x: number
  y: number
}

export interface SpawnConfiguration {
  lastSpawnTime: number
  spawnInterval: number
  maximumEnemies: number
}

export interface EnemyData {
  id: number
  movementSpeed: number
}

export interface GameCoreState {
  remainingTime: number
  currentHealth: number
  maximumHealth: number
  spawnConfig: SpawnConfiguration
  activeEnemies: EnemyData[]
}

export const createInitialGameState = (): GameCoreState => ({
  remainingTime: 60,
  currentHealth: 100,
  maximumHealth: 100,
  spawnConfig: {
    lastSpawnTime: 0,
    spawnInterval: 0.7,
    maximumEnemies: 80
  },
  activeEnemies: [],
})

// ✅ 添加缺失的事件類型
export type GameEvent =
    | { type: 'TICK'; deltaTime: number }
    | { type: 'DAMAGE'; damageAmount: number }
    | { type: 'RESET' }
    | { type: 'SPAWNED'; enemyData: EnemyData }
    | { type: 'KILL_ENEMY'; enemyId: number }
    | { type: 'UPDATE_SPAWN_TIME'; newSpawnTime: number }

type EventHandler<T extends GameEvent> = (state: GameCoreState, event: T) => GameCoreState

const handleGameTick: EventHandler<Extract<GameEvent, { type: 'TICK' }>> = (state, event) => {
  const newRemainingTime = Math.max(0, state.remainingTime - event.deltaTime)
  const difficultyLevel = Math.floor((60 - newRemainingTime) / 10)
  const newSpawnInterval = Math.max(0.5, 0.7 - difficultyLevel * 0.03)

  return {
    ...state,
    remainingTime: newRemainingTime,
    spawnConfig: {
      ...state.spawnConfig,
      spawnInterval: newSpawnInterval
    }
  }
}

const handlePlayerDamage: EventHandler<Extract<GameEvent, { type: 'DAMAGE' }>> = (state, event) => {
  return {
    ...state,
    currentHealth: Math.max(0, state.currentHealth - event.damageAmount)
  }
}

const handleEnemySpawned: EventHandler<Extract<GameEvent, { type: 'SPAWNED' }>> = (state, event) => {
  return {
    ...state,
    activeEnemies: [...state.activeEnemies, event.enemyData]
  }
}

const handleEnemyKilled: EventHandler<Extract<GameEvent, { type: 'KILL_ENEMY' }>> = (state, event) => {
  return {
    ...state,
    activeEnemies: state.activeEnemies.filter(enemy => enemy.id !== event.enemyId)
  }
}

const handleGameReset: EventHandler<Extract<GameEvent, { type: 'RESET' }>> = () => {
  return createInitialGameState()
}

// ✅ 添加缺失的處理器
const handleSpawnTimeUpdate: EventHandler<Extract<GameEvent, { type: 'UPDATE_SPAWN_TIME' }>> = (state, event) => {
  return {
    ...state,
    spawnConfig: {
      ...state.spawnConfig,
      lastSpawnTime: event.newSpawnTime
    }
  }
}

const eventHandlerMap = new Map<GameEvent['type'], (state: GameCoreState, event: any) => GameCoreState>([
  ['TICK', handleGameTick],
  ['DAMAGE', handlePlayerDamage],
  ['SPAWNED', handleEnemySpawned],
  ['KILL_ENEMY', handleEnemyKilled],
  ['RESET', handleGameReset],
  ['UPDATE_SPAWN_TIME', handleSpawnTimeUpdate], // ✅ 添加映射
])

export const reduceGameState = (currentState: GameCoreState, gameEvent: GameEvent): GameCoreState => {
  const eventHandler = eventHandlerMap.get(gameEvent.type)

  if (!eventHandler) {
    console.warn(`Unknown event type: ${gameEvent.type}`)
    return currentState
  }

  return eventHandler(currentState, gameEvent)
}

// 向後相容
export const initialState = createInitialGameState
export const reduce = reduceGameState
export type Vec2 = Vector2D
export type CoreState = GameCoreState
export type CoreEvent = GameEvent