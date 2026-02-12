import Window from './Window'
import CatFaceIcon from './CatFaceIcon'
import './GameOverModal.css'

export default function GameOverModal({ mistakes, onRetry, onNewGame }) {
  return (
    <div className="modal-overlay">
      <Window title="Game Over" color="#e74c3c">
        <div className="gameover-modal">
          <div className="gameover-emoji">♡ <CatFaceIcon expression="sad" size={28} /> ♡</div>
          <h2 className="gameover-title">Game Over!</h2>
          <p className="gameover-text">You made {mistakes} mistakes.</p>
          <div className="gameover-buttons">
            <button className="gameover-btn gameover-btn-retry" onClick={onRetry}>
              ↻ Retry
            </button>
            <button className="gameover-btn gameover-btn-new" onClick={onNewGame}>
              ★ New Game
            </button>
          </div>
        </div>
      </Window>
    </div>
  );
}
