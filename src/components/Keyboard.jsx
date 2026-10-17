const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

/** On-screen QWERTY keyboard whose key colours mirror `statuses` (letter -> correct|present|absent). */
function Keyboard({ statuses, onKey, disabled }) {
  return (
    <div className="keyboard" role="group" aria-label="On-screen keyboard">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE'
            const status = statuses[key]
            return (
              <button
                key={key}
                type="button"
                className={`key${isWide ? ' key--wide' : ''}${status ? ` key--${status}` : ''}`}
                onClick={() => onKey(key)}
                disabled={disabled}
                aria-label={key === 'BACKSPACE' ? 'Backspace' : key}
              >
                {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'Enter' : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
