import './Controls.css'

export default function Controls({ notesMode, onToggleNotes, onUndo, onRedo, onHint, onNewGame, canUndo, canRedo }) {
  return (
    <div className="controls">
      <button className={`ctrl-btn ${notesMode ? 'ctrl-btn-active' : ''}`} onClick={onToggleNotes}>
        ✏ Notes {notesMode ? 'ON' : 'OFF'}
      </button>
      <button className="ctrl-btn" onClick={onUndo} disabled={!canUndo}>
        ↩ Undo
      </button>
      <button className="ctrl-btn" onClick={onRedo} disabled={!canRedo}>
        ↪ Redo
      </button>
      <button className="ctrl-btn ctrl-btn-hint" onClick={onHint}>
        💡 Hint
      </button>
      <button className="ctrl-btn ctrl-btn-new" onClick={onNewGame}>
        ★ New Game
      </button>
    </div>
  );
}
