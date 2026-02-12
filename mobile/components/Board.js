import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Cell from './Cell';

const Board = ({
  board,
  notes,
  givenCells,
  selectedCell,
  conflicts,
  hint,
  onCellPress
}) => {
  const screenWidth = Dimensions.get('window').width;
  const cellSize = Math.floor((screenWidth - 40) / 9);

  const selRow = selectedCell ? selectedCell[0] : null;
  const selCol = selectedCell ? selectedCell[1] : null;

  const isInSameBox = (r, c, selR, selC) => {
    const boxRow = Math.floor(r / 3);
    const boxCol = Math.floor(c / 3);
    const selBoxRow = Math.floor(selR / 3);
    const selBoxCol = Math.floor(selC / 3);
    return boxRow === selBoxRow && boxCol === selBoxCol;
  };

  const isInConflicts = (r, c) => {
    return conflicts && conflicts.some(([cr, cc]) => cr === r && cc === c);
  };

  const isInHintCells = (r, c) => {
    return hint && hint.highlightCells &&
      hint.highlightCells.some(([hr, hc]) => hr === r && hc === c);
  };

  return (
    <View style={styles.boardContainer}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((_, c) => {
            const isSelected = r === selRow && c === selCol;
            const isHighlighted = selectedCell && !isSelected &&
              (r === selRow || c === selCol || isInSameBox(r, c, selRow, selCol));
            const selectedValue = selectedCell ? board[selRow][selCol] : 0;
            const isSameNumber = selectedCell && !isSelected &&
              selectedValue !== 0 && board[r][c] === selectedValue;
            const isError = isInConflicts(r, c);
            const isHintTarget = hint && r === hint.row && c === hint.col;
            const isHintReason = isInHintCells(r, c);

            return (
              <Cell
                key={c}
                value={board[r][c]}
                notes={notes[r][c]}
                isGiven={givenCells[r][c]}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isSameNumber={isSameNumber}
                isError={isError}
                isHintTarget={isHintTarget}
                isHintReason={isHintReason}
                size={cellSize}
                onPress={() => onCellPress(r, c)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
});

export default Board;
