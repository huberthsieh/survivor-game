import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function HUD() {
    // ✅ 使用新的 GameStore API
    const {
        currentHealth,
        maximumHealth,
        remainingTime,
        isPaused,
        isGameOver,
        currentScore,
        enemiesKilled,
        togglePause,
        resetGame
    } = useGameStore()

    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null)

    useEffect(() => {
        // 檢查遊戲結束條件
        if (currentHealth <= 0) {
            setGameResult('lose')
        } else if (remainingTime <= 0) {
            setGameResult('win')
        } else if (isGameOver) {
            // 如果 GameStore 中已經設定遊戲結束
            setGameResult(currentHealth <= 0 ? 'lose' : 'win')
        } else {
            setGameResult(null)
        }
    }, [currentHealth, remainingTime, isGameOver])

    const handleRestart = () => {
        setGameResult(null)
        resetGame()
        // 通知 Phaser 重新開始遊戲
        ;(window as any).phaserGame?.events.emit('restart')
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            color: '#fff',
            fontFamily: 'ui-sans-serif',
            zIndex: 1000
        }}>
            {/* 左上角 - 遊戲狀態 */}
            <div style={{position: 'absolute', left: 16, top: 12}}>
                <div>HP: {currentHealth}/{maximumHealth}</div>
                <div>Time: {Math.ceil(remainingTime)}s</div>
                <div>Score: {currentScore}</div>
                <div>Enemies: {enemiesKilled}</div>
            </div>

            {/* 右上角 - 控制按鈕 */}
            <div style={{
                position: 'absolute',
                right: 16,
                top: 12,
                display: 'flex',
                gap: 8
            }}>
                <button
                    onClick={togglePause}
                    style={buttonStyle}
                    disabled={!!gameResult}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button onClick={handleRestart} style={buttonStyle}>
                    Restart
                </button>
            </div>

            {/* 遊戲結束覆蓋層 */}
            {gameResult && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        padding: 32,
                        background: '#1f2937',
                        borderRadius: 16,
                        pointerEvents: 'auto',
                        textAlign: 'center',
                        border: '2px solid #374151',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2 style={{
                            margin: 0,
                            marginBottom: 16,
                            fontSize: '2rem',
                            color: gameResult === 'win' ? '#10b981' : '#ef4444'
                        }}>
                            {gameResult === 'win' ? '🎉 Victory!' : '💀 Game Over'}
                        </h2>

                        <div style={{
                            marginBottom: 20,
                            fontSize: '1.1rem',
                            color: '#d1d5db'
                        }}>
                            {gameResult === 'win'
                                ? 'You survived the full 60 seconds!'
                                : 'You were overwhelmed by enemies...'
                            }
                        </div>

                        {/* 最終統計 */}
                        <div style={{
                            marginBottom: 24,
                            padding: 16,
                            background: '#111827',
                            borderRadius: 8,
                            border: '1px solid #374151'
                        }}>
                            <div style={{marginBottom: 8}}>Final Score: <strong>{currentScore}</strong></div>
                            <div style={{marginBottom: 8}}>Enemies Defeated: <strong>{enemiesKilled}</strong></div>
                            <div>Survival Time: <strong>{Math.max(0, 60 - remainingTime).toFixed(1)}s</strong></div>
                        </div>

                        <button
                            onClick={handleRestart}
                            style={{
                                ...buttonStyle,
                                padding: '12px 24px',
                                fontSize: '1.1rem',
                                background: gameResult === 'win' ? '#10b981' : '#ef4444',
                                border: 'none'
                            }}
                        >
                            {gameResult === 'win' ? 'Play Again' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}

            {/* 暫停覆蓋層 */}
            {isPaused && !gameResult && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0, 0, 0, 0.6)'
                }}>
                    <div style={{
                        padding: 24,
                        background: '#1f2937',
                        borderRadius: 12,
                        textAlign: 'center',
                        border: '1px solid #374151'
                    }}>
                        <h3 style={{margin: 0, marginBottom: 16}}>Game Paused</h3>
                        <button onClick={togglePause} style={buttonStyle}>
                            Resume Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const buttonStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #374151',
    background: '#374151',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ":hover": {
        background: '#4b5563'
    }
}