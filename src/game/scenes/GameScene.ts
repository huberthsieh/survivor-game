import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'
import { createInitialGameState, reduceGameState, type GameCoreState } from '../logic/state'
import { getMoveVector } from '../logic/input'
import { calculateVelocityFromInput } from '../logic/player'
import { determineEnemySpawn, generateRandomEdgePosition, resetEnemyIdCounter } from '../logic/spawn'
import { calculateSeekVelocity } from '../logic/seek'
import {
    processPlayerEnemyCollision,
    resetCollisionState,
    cleanupRecentCollisions,
    type CollisionEventResult
} from '../logic/collision'
import {
    createGameWorld,
    updateSpriteVelocity,
    spawnEnemy,
    forEachEnemy,
    updateHaloPosition,
    destroyEnemyById,
    type GameWorld
} from '../adapters/phaser'

export class GameScene extends Phaser.Scene {
    private gameWorld!: GameWorld
    private gameCoreState: GameCoreState = createInitialGameState()
    private currentGameTime = 0

    create() {
        this.gameWorld = createGameWorld(this)
        resetCollisionState()
        resetEnemyIdCounter()

        // 初始化 GameStore 狀態
        const gameStore = useGameStore.getState()
        gameStore.resetGame()

        this.physics.add.overlap(
            this.gameWorld.playerSprite,
            this.gameWorld.enemyGroup,
            (player, enemy: any) => {
                const enemyData = {
                    id: enemy.getData('id'),
                    movementSpeed: enemy.getData('speed')
                }

                const collisionResults = processPlayerEnemyCollision(
                    enemyData,
                    this.currentGameTime
                )

                this.handleCollisionResults(collisionResults)
            }
        )

        this.game.events.on('restart', () => {
            this.resetGame()
        })
    }

    private handleCollisionResults(collisionResults: CollisionEventResult[]): void {
        const gameStore = useGameStore.getState()

        for (const result of collisionResults) {
            switch (result.type) {
                case 'PLAYER_DAMAGED':
                    // 更新 GameStore 狀態
                    gameStore.takeDamage(result.damageAmount)

                    // 同步更新核心狀態
                    this.gameCoreState = reduceGameState(this.gameCoreState, {
                        type: 'DAMAGE',
                        damageAmount: result.damageAmount
                    })

                    console.log(`玩家受到 ${result.damageAmount} 點傷害，剩餘血量: ${gameStore.currentHealth}`)

                    // 檢查是否死亡
                    if (gameStore.currentHealth <= 0) {
                        this.handlePlayerDeath()
                    }
                    break

                case 'ENEMY_DESTROYED':
                    gameStore.incrementEnemiesKilled()

                    // 從遊戲世界中移除敵人
                    destroyEnemyById(this.gameWorld, result.destroyedEnemyId)

                    // 更新核心狀態
                    this.gameCoreState = reduceGameState(this.gameCoreState, {
                        type: 'KILL_ENEMY',
                        enemyId: result.destroyedEnemyId
                    })
                    break

                case 'KNOCKBACK_APPLIED':
                    console.log(`對敵人 ${result.targetEnemyId} 施加了擊退效果`)
                    break
            }
        }
    }

    private handlePlayerDeath(): void {
        console.log('玩家死亡，遊戲結束')
        const gameStore = useGameStore.getState()
        gameStore.setGameOver(true)
        this.scene.pause()
    }

    private resetGame(): void {
        console.log('重置遊戲')
        const gameStore = useGameStore.getState()

        // 重置所有狀態
        gameStore.resetGame()
        this.gameCoreState = createInitialGameState()
        this.currentGameTime = 0

        // 重置計數器
        resetCollisionState()
        resetEnemyIdCounter()

        // 重新開始場景
        this.scene.restart()
    }

    update(_: number, deltaTimeMs: number) {
        const deltaTime = deltaTimeMs / 1000
        const gameStore = useGameStore.getState()

        // 如果遊戲暫停或結束，暫停物理引擎
        if (gameStore.isPaused || gameStore.isGameOver) {
            this.physics.world.pause()
            return
        }
        this.physics.world.resume()

        // 更新當前遊戲時間
        this.currentGameTime += deltaTime

        // 定期清理碰撞狀態
        cleanupRecentCollisions(this.currentGameTime)

        // 同步更新兩個狀態的時間
        gameStore.updateTime(deltaTime)
        this.gameCoreState = reduceGameState(this.gameCoreState, {
            type: 'TICK',
            deltaTime: deltaTime
        })

        // 檢查遊戲結束條件
        if (this.gameCoreState.remainingTime <= 0) {
            console.log('時間到，遊戲勝利！')
            gameStore.setGameOver(true)
            this.scene.pause()
            return
        }

        if (gameStore.currentHealth <= 0) {
            this.handlePlayerDeath()
            return
        }

        // 處理玩家移動
        const moveDirection = getMoveVector(this.input.keyboard!)
        const playerVelocity = calculateVelocityFromInput(moveDirection, 200)
        updateSpriteVelocity(this.gameWorld.playerSprite, playerVelocity.x, playerVelocity.y)

        // 處理敵人生成
        const spawnDecision = determineEnemySpawn(this.currentGameTime, this.gameCoreState)

        if (spawnDecision.type === 'SPAWN_ENEMY') {
            const spawnPosition = generateRandomEdgePosition(960, 540)

            console.log(`生成敵人 ID: ${spawnDecision.enemyData.id}，位置: (${spawnPosition.x.toFixed(1)}, ${spawnPosition.y.toFixed(1)})`)

            spawnEnemy(
                this.gameWorld,
                spawnPosition.x,
                spawnPosition.y,
                spawnDecision.enemyData.id,
                spawnDecision.enemyData.movementSpeed
            )

            this.gameCoreState = reduceGameState(this.gameCoreState, {
                type: 'SPAWNED',
                enemyData: spawnDecision.enemyData
            })

            this.gameCoreState = reduceGameState(this.gameCoreState, {
                type: 'UPDATE_SPAWN_TIME',
                newSpawnTime: spawnDecision.nextSpawnTime
            })
        }

        // 更新敵人移動
        forEachEnemy(this.gameWorld, (enemySprite) => {
            const enemyVelocity = calculateSeekVelocity(
                {
                    x: enemySprite.x,
                    y: enemySprite.y,
                    movementSpeed: enemySprite.getData('speed')
                },
                {
                    x: this.gameWorld.playerSprite.x,
                    y: this.gameWorld.playerSprite.y
                }
            )
            updateSpriteVelocity(enemySprite, enemyVelocity.x, enemyVelocity.y)
        })

        // 更新光暈位置
        updateHaloPosition(this.gameWorld)
    }
}