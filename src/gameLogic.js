// Pure game-logic functions for Risky Word, plus small localStorage helpers
// for daily persistence and stats tracking. No backend required — the
// daily word is derived deterministically from the calendar date.
import { WORDS } from './words'

const EPOCH_UTC = Date.UTC(2024, 0, 1) // anchor date for day-numbering
export const MAX_GUESSES = 6

const STATUS_PRIORITY = { absent: 0, present: 1, correct: 2 }
const SHARE_EMOJI = { correct: '🟩', present: '🟨', absent: '⬜' }

/** yyyy-mm-dd key for the given date, in the browser's local timezone. */
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Number of whole days between the epoch anchor and the given date (UTC-based, DST-safe). */
function daysSinceEpoch(date = new Date()) {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((utcMidnight - EPOCH_UTC) / 86400000)
}

/** The word entry ({ word, definition }) assigned to today (or a given date). */
export function getDailyWord(date = new Date(), wordList = WORDS) {
  const index = ((daysSinceEpoch(date) % wordList.length) + wordList.length) % wordList.length
  return wordList[index]
}

/**
 * Wordle-style two-pass evaluation, correctly handling repeated letters.
 * `guess` and `answer` must be the same length. Returns an array of
 * 'correct' | 'present' | 'absent', one per letter of `guess`.
 */
export function evaluateGuess(guess, answer) {
  const guessLetters = guess.toUpperCase().split('')
  const answerLetters = answer.toUpperCase().split('')
  const result = new Array(guessLetters.length).fill('absent')
  const answerClaimed = new Array(answerLetters.length).fill(false)

  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = 'correct'
      answerClaimed[i] = true
    }
  }

  for (let i = 0; i < guessLetters.length; i++) {
    if (result[i] === 'correct') continue
    const matchIndex = answerLetters.findIndex(
      (letter, j) => !answerClaimed[j] && letter === guessLetters[i],
    )
    if (matchIndex !== -1) {
      result[i] = 'present'
      answerClaimed[matchIndex] = true
    }
  }

  return result
}

/** Best-known status per letter across all submitted guesses, for keyboard colouring. */
export function getKeyboardStatuses(guesses, answer) {
  const statuses = {}
  for (const guess of guesses) {
    const evaluation = evaluateGuess(guess, answer)
    guess.toUpperCase().split('').forEach((letter, i) => {
      const status = evaluation[i]
      if (!statuses[letter] || STATUS_PRIORITY[status] > STATUS_PRIORITY[statuses[letter]]) {
        statuses[letter] = status
      }
    })
  }
  return statuses
}

function buildEmojiGrid(guesses, answer) {
  return guesses
    .map((guess) => evaluateGuess(guess, answer).map((status) => SHARE_EMOJI[status]).join(''))
    .join('\n')
}

/** Formatted, LinkedIn-ready share text: emoji grid plus a short caption. */
export function shareResult({ guesses, answer, won, date = new Date() }) {
  const grid = buildEmojiGrid(guesses, answer)
  const scoreLabel = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`
  const dateLabel = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return [
    `Risky Word 🛡️ — ${answer.length} letters · ${dateLabel}`,
    `Solved in ${scoreLabel} guesses`,
    '',
    grid,
    '',
    `Play the London Insurance Market word game 👇`,
    `https://riskyword.com`,
  ].join('\n')
}

// ---------------------------------------------------------------------
// localStorage persistence — daily game state
// ---------------------------------------------------------------------

const STATE_PREFIX = 'riskyword:state:'

/** Load today's in-progress/finished game state, if any was saved. */
export function loadDailyState(key = dateKey()) {
  try {
    const raw = localStorage.getItem(STATE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Persist today's game state: { guesses, status } where status is 'playing' | 'won' | 'lost'. */
export function saveDailyState(state, key = dateKey()) {
  try {
    localStorage.setItem(STATE_PREFIX + key, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

// ---------------------------------------------------------------------
// localStorage persistence — lifetime stats
// ---------------------------------------------------------------------

const STATS_KEY = 'riskyword:stats'

function defaultStats() {
  return {
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    lastPlayedDate: null,
  }
}

/** Load lifetime stats, backfilling any fields missing from an older save. */
export function loadStats() {
  const fallback = defaultStats()
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      ...fallback,
      ...parsed,
      guessDistribution: { ...fallback.guessDistribution, ...parsed.guessDistribution },
    }
  } catch {
    return fallback
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

/**
 * Update lifetime stats after today's result. A win increments the current
 * streak (and max streak, if beaten) and tallies the guess count used; a
 * loss resets the current streak to 0. Idempotent for a given date —
 * calling it twice for the same day does not double-count.
 */
export function recordGameResult(won, guessesTaken, key = dateKey()) {
  const stats = loadStats()
  if (stats.lastPlayedDate === key) return stats // already recorded today

  stats.gamesPlayed += 1
  if (won) {
    stats.gamesWon += 1
    stats.currentStreak += 1
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
    const bucket = Math.min(Math.max(guessesTaken, 1), MAX_GUESSES)
    stats.guessDistribution[bucket] = (stats.guessDistribution[bucket] ?? 0) + 1
  } else {
    stats.currentStreak = 0
  }
  stats.lastPlayedDate = key

  saveStats(stats)
  return stats
}

// ---------------------------------------------------------------------
// Anonymous daily player counter (countapi.xyz)
// ---------------------------------------------------------------------

const COUNTER_NAMESPACE = 'riskyword.com'

/** Read-only fetch of today's play count, for display on page load. Never throws. */
export async function fetchDailyPlayerCount(key = dateKey()) {
  try {
    const res = await fetch(`https://api.countapi.xyz/get/${COUNTER_NAMESPACE}/${key}`)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.value === 'number' ? data.value : null
  } catch {
    return null
  }
}

/** Increments today's play count once a game finishes. Never throws. */
export async function incrementDailyPlayerCount(key = dateKey()) {
  try {
    const res = await fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/${key}`)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.value === 'number' ? data.value : null
  } catch {
    return null
  }
}
