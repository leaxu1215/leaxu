import Window from './Window'
import './WinModal.css'

export default function WinModal({ time, onNewGame, onClose }) {
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="modal-overlay">
      <Window title="You Win!" color="var(--yellow)">
        <div className="win-modal">
          <div className="win-emoji">♥ ☺ ♥</div>
          <h2 className="win-title">Congratulations!</h2>
          <p className="win-text">You solved the puzzle!</p>
          <div className="win-time">
            <span>⏱ Time: {timeStr}</span>
          </div>
          <div className="win-buttons">
            <button className="win-btn win-btn-new" onClick={onNewGame}>
              ★ New Game
            </button>
            <button className="win-btn" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </Window>
    </div>
  );
}
