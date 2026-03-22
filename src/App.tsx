import { useState, useEffect } from 'react'
import type { Route } from './types'
import CreateView from './views/CreateView'
import ShareView from './views/ShareView'
import QuizView from './views/QuizView'

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'create' })

  // 해시 기반 라우팅 (GitHub Pages 호환)
  useEffect(() => {
    const handleHash = () => {
      const hash = location.hash
      if (hash.startsWith('#quiz/')) {
        setRoute({ name: 'quiz', encoded: hash.slice(6) })
      } else {
        setRoute({ name: 'create' })
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const goHome = () => {
    location.hash = ''
    setRoute({ name: 'create' })
  }

  const handleGenerate = (text: string, canvas: HTMLCanvasElement) => {
    setRoute({ name: 'share', text, canvas })
  }

  return (
    <div className="app">
      <header className="header">
        <button className="logo" onClick={goHome} aria-label="홈으로">
          🔮 Secret Letter
        </button>
      </header>

      <main className="main">
        {route.name === 'create' && (
          <CreateView onGenerate={handleGenerate} />
        )}
        {route.name === 'share' && (
          <ShareView
            text={route.text}
            canvas={route.canvas}
            onBack={goHome}
          />
        )}
        {route.name === 'quiz' && (
          <QuizView encoded={route.encoded} onBack={goHome} />
        )}
      </main>
    </div>
  )
}
