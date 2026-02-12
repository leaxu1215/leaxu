import Window from './Window'
import CatFaceIcon from './CatFaceIcon'
import './DifficultyModal.css'

const difficulties = [
  { key: 'easy', label: 'Easy', expression: 'happy', desc: 'Purrfect for beginners' },
  { key: 'medium', label: 'Medium', expression: 'wink', desc: 'A nice cat-llenge' },
  { key: 'hard', label: 'Hard', expression: 'scared', desc: 'For top cats only!' },
];

export default function DifficultyModal({ onSelect, onClose, hasSave, onResume }) {
  return (
    <div className="modal-overlay">
      <Window title="New Game" color="var(--yellow)">
        <div className="difficulty-modal">
          {hasSave && (
            <button className="resume-btn" onClick={onResume}>
              ▶ Resume Saved Game
            </button>
          )}
          <p className="difficulty-prompt">
            {hasSave ? 'Or start a new game:' : 'Choose your difficulty:'}
          </p>
          <div className="difficulty-options">
            {difficulties.map(d => (
              <button key={d.key} className="difficulty-btn" onClick={() => onSelect(d.key)}>
                <span className="difficulty-emoji"><CatFaceIcon expression={d.expression} size={24} /></span>
                <span className="difficulty-label">{d.label}</span>
                <span className="difficulty-desc">{d.desc}</span>
              </button>
            ))}
          </div>
          <button className="difficulty-cancel" onClick={onClose}>Cancel</button>
        </div>
      </Window>
    </div>
  );
}
