import Phaser from 'phaser'

/**
 * 遊戲世界的主要組件
 * 包含場景、玩家、敵人群組和光暈效果
 */
export interface GameWorld {
    gameScene: Phaser.Scene
    playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    enemyGroup: Phaser.Physics.Arcade.Group
    playerHalo: Phaser.GameObjects.Arc
}

/**
 * 敵人精靈的型別定義
 */
export type EnemySprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

/**
 * 創建遊戲世界
 * 初始化玩家、敵人群組、背景和光暈效果
 * @param scene Phaser 場景實例
 * @returns 完整的遊戲世界物件
 */
export const createGameWorld = (scene: Phaser.Scene): GameWorld => {
    // 創建玩家精靈 - 黃色圓形，位於螢幕中央
    const playerSprite = scene.physics.add
        .sprite(480, 270, '') // 空字串表示無材質，使用純色
        .setCircle(16) // 設定碰撞體為半徑16的圓形
        .setTint(0xfff04d) // 設定為黃色

    // 設定玩家不能超出世界邊界
    playerSprite.body.setCollideWorldBounds(true)

    // 創建玩家光暈效果 - 半透明黃色圓圈加外框
    const playerHalo = scene.add
        .circle(playerSprite.x, playerSprite.y, 26, 0xffff00, 0.22) // 半透明黃色圓圈
        .setStrokeStyle(2, 0xffff00) // 黃色外框，寬度2
        .setDepth(10) // 設定渲染深度，確保在其他物件之上

    // 創建敵人群組 - 用於管理多個敵人精靈
    const enemyGroup = scene.physics.add.group()

    // 創建背景 - 深藍灰色矩形覆蓋整個螢幕
    scene.add.rectangle(480, 270, 960, 540, 0x24415a)

    return {
        gameScene: scene,
        playerSprite,
        enemyGroup,
        playerHalo
    }
}

/**
 * 更新光暈位置，讓它跟隨玩家移動
 * @param world 遊戲世界物件
 */
export const updateHaloPosition = (world: GameWorld): void => {
    world.playerHalo.setPosition(world.playerSprite.x, world.playerSprite.y)
}

/**
 * 在指定位置生成敵人精靈
 * @param world 遊戲世界物件
 * @param positionX X 座標
 * @param positionY Y 座標
 * @param enemyId 敵人的唯一識別ID
 * @param movementSpeed 移動速度
 * @returns 新創建的敵人精靈
 */
export const spawnEnemy = (
    world: GameWorld,
    positionX: number,
    positionY: number,
    enemyId: number,
    movementSpeed: number
): EnemySprite => {
    const enemySprite = world.enemyGroup.create(positionX, positionY, '') as EnemySprite

    enemySprite
        .setCircle(10) // 設定碰撞體為半徑10的圓形
        .setTint(0x89ffaa) // 設定為淺綠色

    // 儲存敵人的自訂資料
    enemySprite.setData('id', enemyId)
    enemySprite.setData('speed', movementSpeed)

    return enemySprite
}

/**
 * 設定精靈的移動速度
 * @param sprite 要設定速度的精靈
 * @param velocityX X 軸速度
 * @param velocityY Y 軸速度
 */
export const updateSpriteVelocity = (
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    velocityX: number,
    velocityY: number
): void => {
    sprite.setVelocity(velocityX, velocityY)
}

/**
 * 遍歷所有敵人並執行指定函數
 * @param world 遊戲世界物件
 * @param callback 要對每個敵人執行的函數
 */
export const forEachEnemy = (
    world: GameWorld,
    callback: (enemy: EnemySprite) => void
): void => {
    world.enemyGroup.children.iterate((gameObject: any) => {
        // 確保物件有物理體才執行回調函數
        if (gameObject?.body) {
            callback(gameObject as EnemySprite)
        }
    })
}

/**
 * 根據ID銷毀指定的敵人
 * @param world 遊戲世界物件
 * @param enemyId 要銷毀的敵人ID
 */
export const destroyEnemyById = (world: GameWorld, enemyId: number): void => {
    forEachEnemy(world, (enemy) => {
        if (enemy.getData('id') === enemyId) {
            enemy.destroy()
        }
    })
}