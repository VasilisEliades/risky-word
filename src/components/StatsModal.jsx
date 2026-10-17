import { useState } from 'react'
import { MAX_GUESSES, shareResult } from '../gameLogic'

// The native share sheet is only useful on touch devices: that's where an
// app like LinkedIn's is likely to be registered as a share target. On a
// laptop/desktop (even ones that technically implement navigator.share),
// the OS panel just lists Mail/Copilot/etc. with no LinkedIn option, so we
// skip straight to the clipboard + web-tab fallback there instead.
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const supportsNativeShare =
  typeof navigator !== 'undefined' && typeof navigator.share === 'function' && isTouchDevice

/**
 * Stats modal: doubles as the end-of-game result screen (opened
 * automatically on win/loss) and the anytime "view my stats" screen
 * (opened from the header icon). The answer/definition reveal and share
 * button only appear once today's game is actually finished, so opening
 * it mid-game never spoils the word.
 */
function StatsModal({ open, onClose, status, guesses, wordEntry, stats }) {
  const [copyState, setCopyState] = useState('idle') // idle | copied | error

  if (!open) return null

  const finished = status === 'won' || status === 'lost'
  const won = status === 'won'
  const winPct = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0
  const maxCount = Math.max(1, ...Object.values(stats.guessDistribution))

  async function handleShare() {
    const text = shareResult({ guesses, answer: wordEntry.word, won })

    if (supportsNativeShare) {
      try {
        await navigator.share({ text })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    } finally {
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {finished ? (
          <>
            <p className="modal__eyebrow">{won ? 'Risk placed' : 'Risk declined'}</p>
            <h2 id="stats-modal-title" className="modal__title">
              {won ? 'You got it!' : 'Out of guesses'}
            </h2>
            {won ? (
              <p className="modal__lede">
                Solved in <strong>{guesses.length}</strong> of {MAX_GUESSES} guesses.
              </p>
            ) : (
              <p className="modal__lede">The answer was:</p>
            )}
            <div className="modal__answer">
              <span className="modal__answer-word">{wordEntry.word}</span>
              <span className="modal__answer-def">{wordEntry.definition}</span>
            </div>
          </>
        ) : (
          <h2 id="stats-modal-title" className="modal__title">
            Statistics
          </h2>
        )}

        <div className="stats-grid">
          <div className="stats-grid__box">
            <span className="stats-grid__value">{stats.gamesPlayed}</span>
            <span className="stats-grid__label">Played</span>
          </div>
          <div className="stats-grid__box">
            <span className="stats-grid__value">{winPct}</span>
            <span className="stats-grid__label">Win %</span>
          </div>
          <div className="stats-grid__box">
            <span className="stats-grid__value">{stats.currentStreak}</span>
            <span className="stats-grid__label">Current Streak</span>
          </div>
          <div className="stats-grid__box">
            <span className="stats-grid__value">{stats.maxStreak}</span>
            <span className="stats-grid__label">Max Streak</span>
          </div>
        </div>

        <div className="dist-chart">
          <p className="dist-chart__title">Guess Distribution</p>
          {Array.from({ length: MAX_GUESSES }, (_, i) => i + 1).map((n) => {
            const count = stats.guessDistribution[n] ?? 0
            const isCurrent = won && guesses.length === n
            const widthPct = count > 0 ? Math.max((count / maxCount) * 100, 8) : 4
            return (
              <div className="dist-chart__row" key={n}>
                <span className="dist-chart__label">{n}</span>
                <div className="dist-chart__track">
                  <div
                    className={`dist-chart__bar${isCurrent ? ' dist-chart__bar--current' : ''}`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="dist-chart__count">{count}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {finished ? (
          <>
            <button type="button" className="modal__share" onClick={handleShare}>
              <span aria-hidden="true">🔗</span>{' '}
              {supportsNativeShare ? 'Share Result' : 'Share on LinkedIn'}
            </button>
            {supportsNativeShare && (
              <p className="modal__copy-note">Pick LinkedIn from the share sheet to post there.</p>
            )}
            {!supportsNativeShare && copyState !== 'error' && (
              <p className="modal__copy-note">
                {copyState === 'copied' ? (
                  <>
                    Copied! Switch to the LinkedIn tab and press <strong>Ctrl/Cmd+V</strong> to paste
                    it.
                  </>
                ) : (
                  <>
                    LinkedIn doesn’t auto-fill posts, so this copies your result and opens LinkedIn —
                    press <strong>Ctrl/Cmd+V</strong> there to paste it in.
                  </>
                )}
              </p>
            )}
            {!supportsNativeShare && copyState === 'error' && (
              <p className="modal__copy-note modal__copy-note--error">
                Couldn’t copy automatically — switch to the LinkedIn tab and type your result
                manually, or copy it here first.
              </p>
            )}
            <p className="modal__next">Come back tomorrow for the next risk.</p>
          </>
        ) : (
          <p className="modal__next">Finish today’s word to share your result.</p>
        )}
      </div>
    </div>
  )
}

export default StatsModal
