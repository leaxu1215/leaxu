import Cell from './Cell'
import './Board.css'

export default function Board({ board, notes, givenCells, selectedCell, conflicts, onCellClick }) {
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
