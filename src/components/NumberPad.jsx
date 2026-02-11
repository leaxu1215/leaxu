import './NumberPad.css'

export default function NumberPad({ onNumber, onErase, notesMode }) {
  return (
    <div className="numberpad">
      <div className="numberpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} className="num-btn" onClick={() => onNumber(n)}>
            {n}
          </button>
        ))}
      </div>
      <button className="erase-btn" onClick={onErase}>
        ✖ Erase
      </button>
    </div>
  );
}
