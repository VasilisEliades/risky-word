import Tile from './Tile'
import { evaluateGuess } from '../gameLogic'

const TILE_FLIP_STAGGER_MS = 220

/**
 * The guess grid. `wordLength` rows are sized responsively via the
 * --tile-w custom property so 5-letter and 12-letter answers both fit
 * comfortably on mobile widths.
 */
function Board({
  wordLength,
  maxGuesses,
  guesses,
  currentGuess,
  answer,
  animatingRow,
  shakeRow,
}) {
  const boardStyle = {
    '--word-length': wordLength,
    '--tile-w': `clamp(26px, calc((100vw - 64px - ${(wordLength - 1) * 6}px) / ${wordLength}), 58px)`,
  }

  const rows = Array.from({ length: maxGuesses }, (_, r) => {
    if (r < guesses.length) {
      const guess = guesses[r]
      return { letters: guess.split(''), statuses: evaluateGuess(guess, answer) }
    }
    if (r === guesses.length) {
      return { letters: currentGuess.split(''), statuses: [] }
    }
    return { letters: [], statuses: [] }
  })

  return (
    <div className="board" style={boardStyle}>
      {rows.map((row, r) => (
        <div
          key={r}
          className={`board-row${shakeRow === r ? ' board-row--shake' : ''}`}
        >
          {Array.from({ length: wordLength }, (_, c) => {
            const letter = row.letters[c] ?? ''
            const status = row.statuses[c] ?? 'empty'
            return (
              <Tile
                key={c}
                letter={letter}
                status={status}
                animate={animatingRow === r}
                delay={c * TILE_FLIP_STAGGER_MS}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Board
