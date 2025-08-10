import {createRoot} from 'react-dom/client'
import {StrictMode, useEffect} from 'react'
import {HUD} from './ui/HUD'
import {startGame} from './game'

function Boot() {
    useEffect(() => {
        const g = startGame()
        ;(window as any).phaserGame = g
        return () => g.destroy(true)
    }, [])
    return <HUD/>
}

createRoot(document.getElementById('root')!).render(
    <StrictMode><Boot/></StrictMode>
)
