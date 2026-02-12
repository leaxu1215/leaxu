import Window from './Window'
import './HintPanel.css'

export default function HintPanel({ hint, onDismiss, onApply }) {
  if (!hint) return null;

  const isError = hint.technique === 'error';

  return (
    <div className="hint-panel">
      <Window title="💡 Hint" color="var(--yellow)">
        <div className="hint-content">
          <p className="hint-message">{hint.message}</p>
          <div className="hint-buttons">
            <button className="hint-btn hint-btn-dismiss" onClick={onDismiss}>
              Got it!
            </button>
            {!isError && (
              <button className="hint-btn hint-btn-apply" onClick={onApply}>
                Fill it in
              </button>
            )}
          </div>
        </div>
      </Window>
    </div>
  );
}
