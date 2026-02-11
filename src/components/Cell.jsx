import './Cell.css'

export default function Cell({ value, notes, isGiven, isSelected, isHighlighted, isSameNumber, isError, row, col, onClick }) {
  const classes = [
    'cell',
    isGiven && 'cell-given',
    isSelected && 'cell-selected',
    isHighlighted && 'cell-highlighted',
    isSameNumber && 'cell-same-number',
    isError && 'cell-error',
    col % 3 === 2 && col !== 8 && 'cell-box-right',
    row % 3 === 2 && row !== 8 && 'cell-box-bottom',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {value ? (
        <span className="cell-value">{value}</span>
      ) : notes && notes.size > 0 ? (
        <div className="cell-notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span key={n} className={notes.has(n) ? 'note-visible' : 'note-hidden'}>
              {notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
