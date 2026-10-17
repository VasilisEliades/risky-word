const FLIP_BG_VAR = {
  correct: 'var(--color-correct)',
  present: 'var(--color-present)',
  absent: 'var(--color-absent)',
}

/**
 * A single letter tile. While `animate` is true the tile is mid-flip: the
 * coloured background is applied by the CSS keyframes (via the --flip-bg
 * custom property) at the halfway point of the rotation, not by a status
 * class, so the tile still reads as "in progress" until the flip lands.
 */
function Tile({ letter = '', status = 'empty', animate = false, delay = 0 }) {
  const isEvaluated = status === 'correct' || status === 'present' || status === 'absent'

  const className = [
    'tile',
    animate ? 'tile--flip' : isEvaluated ? `tile--${status}` : '',
    !animate && !isEvaluated && letter ? 'tile--filled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const style = {}
  if (animate) {
    style.animationDelay = `${delay}ms`
    style['--flip-bg'] = FLIP_BG_VAR[status]
  }

  return (
    <div className={className} style={style} data-status={status}>
      <span className="tile__letter">{letter}</span>
    </div>
  )
}

export default Tile
