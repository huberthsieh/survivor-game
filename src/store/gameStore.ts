import { create } from 'zustand'

/**
 * 遊戲 UI 狀態介面
 * 管理與遊戲核心邏輯分離的 UI 相關狀態
 */
interface GameUIState {
    // 玩家狀態
    currentHealth: number
    maximumHealth: number

    // 遊戲進度
    remainingTime: number
    currentScore: number

    // 遊戲控制
    isPaused: boolean
    isGameOver: boolean

    // 統計數據
    enemiesKilled: number
    totalDamageTaken: number
    survivalTime: number

    // UI 設定
    showDebugInfo: boolean
    soundEnabled: boolean
    musicVolume: number
    effectsVolume: number
}

/**
 * 遊戲 Store 動作介面
 */
interface GameStoreActions {
    // 玩家狀態管理
    setHealth: (newHealth: number) => void
    takeDamage: (damageAmount: number) => void
    healPlayer: (healAmount: number) => void

    // 時間管理
    updateTime: (deltaTime: number) => void
    setRemainingTime: (time: number) => void

    // 分數管理
    addScore: (points: number) => void
    resetScore: () => void

    // 遊戲控制
    togglePause: () => void
    setPauseState: (paused: boolean) => void
    setGameOver: (gameOver: boolean) => void

    // 統計更新
    incrementEnemiesKilled: () => void
    addDamageTaken: (damage: number) => void
    updateSurvivalTime: (time: number) => void

    // UI 設定
    toggleDebugInfo: () => void
    setSoundEnabled: (enabled: boolean) => void
    setMusicVolume: (volume: number) => void
    setEffectsVolume: (volume: number) => void

    // 遊戲重置
    resetGame: () => void
    resetStatistics: () => void
}

/**
 * 完整的遊戲狀態型別
 */
type GameStoreState = GameUIState & GameStoreActions

/**
 * 預設的遊戲狀態
 */
const defaultGameState: GameUIState = {
    // 玩家狀態
    currentHealth: 100,
    maximumHealth: 100,

    // 遊戲進度
    remainingTime: 60,
    currentScore: 0,

    // 遊戲控制
    isPaused: false,
    isGameOver: false,

    // 統計數據
    enemiesKilled: 0,
    totalDamageTaken: 0,
    survivalTime: 0,

    // UI 設定
    showDebugInfo: false,
    soundEnabled: true,
    musicVolume: 0.7,
    effectsVolume: 0.8
}

/**
 * Zustand 遊戲狀態管理 Store
 * 管理遊戲的 UI 狀態和用戶互動
 */
export const useGameStore = create<GameStoreState>((set, get) => ({
    // 初始狀態
    ...defaultGameState,

    // 玩家狀態管理
    setHealth: (newHealth: number) => {
        set(state => ({
            currentHealth: Math.max(0, Math.min(newHealth, state.maximumHealth))
        }))
    },

    takeDamage: (damageAmount: number) => {
        set(state => {
            const newHealth = Math.max(0, state.currentHealth - damageAmount)
            const isGameOver = newHealth <= 0

            return {
                currentHealth: newHealth,
                totalDamageTaken: state.totalDamageTaken + damageAmount,
                isGameOver: isGameOver || state.isGameOver
            }
        })
    },

    healPlayer: (healAmount: number) => {
        set(state => ({
            currentHealth: Math.min(state.maximumHealth, state.currentHealth + healAmount)
        }))
    },

    // 時間管理
    updateTime: (deltaTime: number) => {
        set(state => {
            const newTime = Math.max(0, state.remainingTime - deltaTime)
            const newSurvivalTime = state.survivalTime + deltaTime
            const isGameOver = newTime <= 0

            return {
                remainingTime: newTime,
                survivalTime: newSurvivalTime,
                isGameOver: isGameOver || state.isGameOver
            }
        })
    },

    setRemainingTime: (time: number) => {
        set({remainingTime: Math.max(0, time)})
    },

    // 分數管理
    addScore: (points: number) => {
        set(state => ({
            currentScore: state.currentScore + points
        }))
    },

    resetScore: () => {
        set({currentScore: 0})
    },

    // 遊戲控制
    togglePause: () => {
        set(state => ({isPaused: !state.isPaused}))
    },

    setPauseState: (paused: boolean) => {
        set({isPaused: paused})
    },

    setGameOver: (gameOver: boolean) => {
        set({isGameOver: gameOver})
    },

    // 統計更新
    incrementEnemiesKilled: () => {
        set(state => ({
            enemiesKilled: state.enemiesKilled + 1,
            currentScore: state.currentScore + 100 // 每殺死一個敵人得100分
        }))
    },

    addDamageTaken: (damage: number) => {
        set(state => ({
            totalDamageTaken: state.totalDamageTaken + damage
        }))
    },

    updateSurvivalTime: (time: number) => {
        set({survivalTime: time})
    },

    // UI 設定
    toggleDebugInfo: () => {
        set(state => ({showDebugInfo: !state.showDebugInfo}))
    },

    setSoundEnabled: (enabled: boolean) => {
        set({soundEnabled: enabled})
    },

    setMusicVolume: (volume: number) => {
        set({musicVolume: Math.max(0, Math.min(1, volume))})
    },

    setEffectsVolume: (volume: number) => {
        set({effectsVolume: Math.max(0, Math.min(1, volume))})
    },

    // 遊戲重置
    resetGame: () => {
        set({...defaultGameState})
    },

    resetStatistics: () => {
        set({
            enemiesKilled: 0,
            totalDamageTaken: 0,
            survivalTime: 0,
            currentScore: 0
        })
    }
}))

// 為了向後相容，提供舊的 API
export const useLegacyGameStore = create<{
    hp: number
    maxHp: number
    timeLeft: number
    paused: boolean
    setHp: (v: number) => void
    tick: (dt: number) => void
    togglePause: () => void
    reset: () => void
}>((set) => ({
    hp: 100,
    maxHp: 100,
    timeLeft: 60,
    paused: false,
    setHp: (v) => set({hp: Math.max(0, v)}),
    tick: (dt) => set(s => ({timeLeft: Math.max(0, s.timeLeft - dt)})),
    togglePause: () => set(s => ({paused: !s.paused})),
    reset: () => set({hp: 100, maxHp: 100, timeLeft: 60, paused: false}),
}))