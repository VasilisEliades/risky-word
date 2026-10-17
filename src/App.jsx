import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Board from './components/Board'
import Keyboard from './components/Keyboard'
import StatsModal from './components/StatsModal'
import {
  MAX_GUESSES,
  dateKey,
  getDailyWord,
  getKeyboardStatuses,
  loadDailyState,
  saveDailyState,
  loadStats,
  recordGameResult,
  fetchDailyPlayerCount,
  incrementDailyPlayerCount,
} from './gameLogic'
import './App.css'

const TILE_FLIP_STAGGER_MS = 220
const TILE_FLIP_DURATION_MS = 500
const SHAKE_DURATION_MS = 400
const TOAST_DURATION_MS = 1500

function App() {
  const today = useMemo(() => dateKey(), [])
  const wordEntry = useMemo(() => getDailyWord(), [])
  const wordLength = wordEntry.word.length

  const initial = useMemo(() => loadDailyState(today), [today])

  const [guesses, setGuesses] = useState(initial?.guesses ?? [])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState(initial?.status ?? 'playing')
  const [animatingRow, setAnimatingRow] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [shakeRow, setShakeRow] = useState(null)
  const [toast, setToast] = useState(null)
  const [statsModalOpen, setStatsModalOpen] = useState(initial?.status && initial.status !== 'playing')
  const [stats, setStats] = useState(() => loadStats())
  const [playerCount, setPlayerCount] = useState(null)

  const toastTimer = useRef(null)
  const shakeTimer = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }, [])

  const triggerShake = useCallback((rowIndex) => {
    setShakeRow(rowIndex)
    clearTimeout(shakeTimer.current)
    shakeTimer.current = setTimeout(() => setShakeRow(null), SHAKE_DURATION_MS)
  }, [])

  // If the page is reloaded after today's game already finished, make sure
  // it's reflected in lifetime stats (recordGameResult is idempotent per
  // day, so this is a no-op if it was already recorded).
  useEffect(() => {
    if (initial?.status && initial.status !== 'playing') {
      setStats(recordGameResult(initial.status === 'won', initial.guesses.length, today))
    }
    return () => {
      clearTimeout(toastTimer.current)
      clearTimeout(shakeTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchDailyPlayerCount(today).then((count) => {
      if (count != null) setPlayerCount(count)
    })
  }, [today])

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing' || isRevealing) return

    if (currentGuess.length < wordLength) {
      triggerShake(guesses.length)
      showToast('Not enough letters')
      return
    }

    const newGuesses = [...guesses, currentGuess]
    const rowIndex = newGuesses.length - 1
    const won = currentGuess === wordEntry.word
    const lost = !won && newGuesses.length >= MAX_GUESSES

    setGuesses(newGuesses)
    setAnimatingRow(rowIndex)
    setIsRevealing(true)

    const revealMs = (wordLength - 1) * TILE_FLIP_STAGGER_MS + TILE_FLIP_DURATION_MS

    setTimeout(() => {
      setAnimatingRow(null)
      setIsRevealing(false)

      const status = won ? 'won' : lost ? 'lost' : 'playing'
      saveDailyState({ guesses: newGuesses, status }, today)
      setCurrentGuess('')

      if (won || lost) {
        setStats(recordGameResult(won, newGuesses.length, today))
        setGameStatus(status)
        setStatsModalOpen(true)
        incrementDailyPlayerCount(today).then((count) => {
          if (count != null) setPlayerCount(count)
        })
      }
    }, revealMs)
  }, [currentGuess, gameStatus, guesses, isRevealing, showToast, today, triggerShake, wordEntry.word, wordLength])

  const handleKey = useCallback(
    (key) => {
      if (gameStatus !== 'playing' || isRevealing) return

      if (key === 'ENTER') {
        submitGuess()
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((g) => g.slice(0, -1))
      } else if (/^[A-Z]$/.test(key)) {
        setCurrentGuess((g) => (g.length < wordLength ? g + key : g))
      }
    },
    [gameStatus, isRevealing, submitGuess, wordLength],
  )

  useEffect(() => {
    if (statsModalOpen) return

    function onKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key === 'Enter' ? 'ENTER' : e.key === 'Backspace' ? 'BACKSPACE' : e.key.toUpperCase()
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault()
        handleKey(key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, statsModalOpen])

  const keyboardStatuses = useMemo(
    () => getKeyboardStatuses(guesses, wordEntry.word),
    [guesses, wordEntry.word],
  )

  const finished = gameStatus !== 'playing'

  return (
    <div className="app">
      <Header streak={stats.currentStreak} onStatsClick={() => setStatsModalOpen(true)} />

      <main className="app__main">
        <Board
          wordLength={wordLength}
          maxGuesses={MAX_GUESSES}
          guesses={guesses}
          currentGuess={currentGuess}
          answer={wordEntry.word}
          animatingRow={animatingRow}
          shakeRow={shakeRow}
        />

        {toast && <div className="toast">{toast}</div>}

        {playerCount != null && (
          <p className="player-count">{playerCount.toLocaleString()} people have played today's word</p>
        )}

        {finished && !statsModalOpen && (
          <button type="button" className="app__result-btn" onClick={() => setStatsModalOpen(true)}>
            View result
          </button>
        )}

        <Keyboard statuses={keyboardStatuses} onKey={handleKey} disabled={finished || isRevealing} />
      </main>

      <StatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        status={gameStatus}
        guesses={guesses}
        wordEntry={wordEntry}
        stats={stats}
      />
    </div>
  )
}

export default App
