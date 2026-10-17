/** Top bar: wordmark on the left, streak + stats icon on the right. */
function Header({ streak, onStatsClick }) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__mark" aria-hidden="true">
          🎯
        </span>
        <h1 className="header__title">Risky Word</h1>
      </div>

      <div className="header__actions">
        <span className="header__streak" title="Current streak">
          <span className="header__streak-flame" aria-hidden="true">
            🔥
          </span>
          <span className="header__streak-count">{streak}</span>
        </span>

        <button
          type="button"
          className="header__icon-btn"
          onClick={onStatsClick}
          aria-label="Statistics"
          title="Statistics"
        >
          📊
        </button>
      </div>
    </header>
  )
}

export default Header
