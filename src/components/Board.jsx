import Cell from './Cell'
import './Board.css'

export default function Board({ board, notes, givenCells, selectedCell, conflicts, hint, onCellClick }) {
  const [selRow, selCol] = selectedCell || [-1, -1];
  const selectedValue = selRow >= 0 ? board[selRow][selCol] : 0;

  return (
    <div className="board">
      {board.map((row, r) =>
        row.map((value, c) => {
          const isSelected = r === selRow && c === selCol;
          const isHighlighted = r === selRow || c === selCol ||
            (Math.floor(r / 3) === Math.floor(selRow / 3) && Math.floor(c / 3) === Math.floor(selCol / 3));
          const isSameNumber = selectedValue !== 0 && value === selectedValue && !isSelected;
          const isError = conflicts.some(([cr, cc]) => cr === r && cc === c);
          const isHintTarget = hint && r === hint.row && c === hint.col;
          const isHintReason = hint && hint.highlightCells && hint.highlightCells.some(([hr, hc]) => hr === r && hc === c);

          return (
            <Cell
              key={`${r}-${c}`}
              value={value}
              notes={notes[r]?.[c]}
              isGiven={givenCells[r][c]}
              isSelected={isSelected}
              isHighlighted={isHighlighted && !isSelected}
              isSameNumber={isSameNumber}
              isError={isError}
              isHintTarget={isHintTarget}
              isHintReason={isHintReason}
              row={r}
              col={c}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}
