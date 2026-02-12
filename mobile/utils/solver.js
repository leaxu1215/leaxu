// Human-like Sudoku solver using progressive techniques
// Used to grade puzzle difficulty based on which techniques are required

// Difficulty levels
export const LEVEL = {
  NAKED_SINGLE: 1,    // Easy
  HIDDEN_SINGLE: 2,   // Medium
  NAKED_PAIR: 3,       // Hard
  POINTING_PAIR: 4,    // Hard
  BOX_LINE: 5,         // Hard
};

// Get all peers (cells that share a row, column, or box) for a given cell
function getPeers(row, col) {
  const peers = [];
  for (let i = 0; i < 9; i++) {
    if (i !== col) peers.push([row, i]);
    if (i !== row) peers.push([i, col]);
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col) {
        if (!peers.some(([pr, pc]) => pr === r && pc === c)) {
          peers.push([r, c]);
        }
      }
    }
  }
  return peers;
}

// Compute candidates for every empty cell
export function getCandidates(board) {
  const candidates = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => null)
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const cands = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const [pr, pc] of getPeers(r, c)) {
        cands.delete(board[pr][pc]);
      }
      for (let i = 0; i < 9; i++) {
        cands.delete(board[r][i] === 0 ? 0 : board[r][i]);
        cands.delete(board[i][c] === 0 ? 0 : board[i][c]);
      }
      cands.delete(0);
      candidates[r][c] = cands;
    }
  }
  return candidates;
}

// Technique 1: Naked Single
function findNakedSingle(candidates) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (candidates[r][c] && candidates[r][c].size === 1) {
        const val = [...candidates[r][c]][0];
        return { row: r, col: c, val };
      }
    }
  }
  return null;
}

// Technique 2: Hidden Single
function findHiddenSingle(board, candidates) {
  for (let r = 0; r < 9; r++) {
    for (let num = 1; num <= 9; num++) {
      if (board[r].includes(num)) continue;
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push(c);
        }
      }
      if (positions.length === 1) {
        return { row: r, col: positions[0], val: num };
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    for (let num = 1; num <= 9; num++) {
      let found = false;
      for (let r = 0; r < 9; r++) {
        if (board[r][c] === num) { found = true; break; }
      }
      if (found) continue;
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push(r);
        }
      }
      if (positions.length === 1) {
        return { row: positions[0], col: c, val: num };
      }
    }
  }

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      for (let num = 1; num <= 9; num++) {
        let found = false;
        const positions = [];
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            if (board[r][c] === num) { found = true; break; }
            if (candidates[r][c] && candidates[r][c].has(num)) {
              positions.push([r, c]);
            }
          }
          if (found) break;
        }
        if (found) continue;
        if (positions.length === 1) {
          return { row: positions[0][0], col: positions[0][1], val: num };
        }
      }
    }
  }

  return null;
}

// Technique 3: Naked Pair
function applyNakedPairs(candidates) {
  let changed = false;

  function processUnit(cells) {
    const pairs = cells.filter(([r, c]) => candidates[r][c] && candidates[r][c].size === 2);
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        const [r1, c1] = pairs[i];
        const [r2, c2] = pairs[j];
        const set1 = candidates[r1][c1];
        const set2 = candidates[r2][c2];
        if (set1.size === 2 && set2.size === 2) {
          const vals1 = [...set1];
          const vals2 = [...set2];
          if (vals1[0] === vals2[0] && vals1[1] === vals2[1]) {
            for (const [r, c] of cells) {
              if ((r === r1 && c === c1) || (r === r2 && c === c2)) continue;
              if (!candidates[r][c]) continue;
              for (const v of vals1) {
                if (candidates[r][c].has(v)) {
                  candidates[r][c].delete(v);
                  changed = true;
                }
              }
            }
          }
        }
      }
    }
  }

  for (let r = 0; r < 9; r++) {
    const cells = [];
    for (let c = 0; c < 9; c++) cells.push([r, c]);
    processUnit(cells);
  }
  for (let c = 0; c < 9; c++) {
    const cells = [];
    for (let r = 0; r < 9; r++) cells.push([r, c]);
    processUnit(cells);
  }
  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      const cells = [];
      for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
        for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
          cells.push([r, c]);
        }
      }
      processUnit(cells);
    }
  }

  return changed;
}

// Technique 4: Pointing Pair
function applyPointingPairs(candidates) {
  let changed = false;

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      for (let num = 1; num <= 9; num++) {
        const positions = [];
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            if (candidates[r][c] && candidates[r][c].has(num)) {
              positions.push([r, c]);
            }
          }
        }
        if (positions.length < 2 || positions.length > 3) continue;

        const allSameRow = positions.every(([r]) => r === positions[0][0]);
        if (allSameRow) {
          const row = positions[0][0];
          for (let c = 0; c < 9; c++) {
            if (Math.floor(c / 3) === boxC) continue;
            if (candidates[row][c] && candidates[row][c].has(num)) {
              candidates[row][c].delete(num);
              changed = true;
            }
          }
        }

        const allSameCol = positions.every(([, c]) => c === positions[0][1]);
        if (allSameCol) {
          const col = positions[0][1];
          for (let r = 0; r < 9; r++) {
            if (Math.floor(r / 3) === boxR) continue;
            if (candidates[r][col] && candidates[r][col].has(num)) {
              candidates[r][col].delete(num);
              changed = true;
            }
          }
        }
      }
    }
  }

  return changed;
}

// Technique 5: Box/Line Reduction
function applyBoxLineReduction(candidates) {
  let changed = false;

  for (let r = 0; r < 9; r++) {
    for (let num = 1; num <= 9; num++) {
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push([r, c]);
        }
      }
      if (positions.length < 2 || positions.length > 3) continue;
      const boxCol = Math.floor(positions[0][1] / 3);
      if (!positions.every(([, c]) => Math.floor(c / 3) === boxCol)) continue;

      const boxRow = Math.floor(r / 3);
      for (let br = boxRow * 3; br < boxRow * 3 + 3; br++) {
        if (br === r) continue;
        for (let bc = boxCol * 3; bc < boxCol * 3 + 3; bc++) {
          if (candidates[br][bc] && candidates[br][bc].has(num)) {
            candidates[br][bc].delete(num);
            changed = true;
          }
        }
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    for (let num = 1; num <= 9; num++) {
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push([r, c]);
        }
      }
      if (positions.length < 2 || positions.length > 3) continue;
      const boxRow = Math.floor(positions[0][0] / 3);
      if (!positions.every(([r]) => Math.floor(r / 3) === boxRow)) continue;

      const boxCol = Math.floor(c / 3);
      for (let bc = boxCol * 3; bc < boxCol * 3 + 3; bc++) {
        if (bc === c) continue;
        for (let br = boxRow * 3; br < boxRow * 3 + 3; br++) {
          if (candidates[br][bc] && candidates[br][bc].has(num)) {
            candidates[br][bc].delete(num);
            changed = true;
          }
        }
      }
    }
  }

  return changed;
}

export function solve(board, maxLevel = 5) {
  const b = board.map(row => [...row]);
  let highestLevel = 0;
  let maxIterations = 500;

  while (maxIterations-- > 0) {
    let emptyCells = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) emptyCells++;
      }
    }
    if (emptyCells === 0) {
      return { solved: true, highestLevel };
    }

    const candidates = getCandidates(b);

    let invalid = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0 && candidates[r][c] && candidates[r][c].size === 0) {
          invalid = true;
        }
      }
    }
    if (invalid) return { solved: false, highestLevel };

    if (maxLevel >= LEVEL.NAKED_SINGLE) {
      const ns = findNakedSingle(candidates);
      if (ns) {
        b[ns.row][ns.col] = ns.val;
        highestLevel = Math.max(highestLevel, LEVEL.NAKED_SINGLE);
        continue;
      }
    }

    if (maxLevel >= LEVEL.HIDDEN_SINGLE) {
      const hs = findHiddenSingle(b, candidates);
      if (hs) {
        b[hs.row][hs.col] = hs.val;
        highestLevel = Math.max(highestLevel, LEVEL.HIDDEN_SINGLE);
        continue;
      }
    }

    if (maxLevel >= LEVEL.NAKED_PAIR) {
      if (applyNakedPairs(candidates)) {
        highestLevel = Math.max(highestLevel, LEVEL.NAKED_PAIR);
        const ns = findNakedSingle(candidates);
        if (ns) {
          b[ns.row][ns.col] = ns.val;
          continue;
        }
        const hs = findHiddenSingle(b, candidates);
        if (hs) {
          b[hs.row][hs.col] = hs.val;
          continue;
        }
      }
    }

    if (maxLevel >= LEVEL.POINTING_PAIR) {
      if (applyPointingPairs(candidates)) {
        highestLevel = Math.max(highestLevel, LEVEL.POINTING_PAIR);
        const ns = findNakedSingle(candidates);
        if (ns) {
          b[ns.row][ns.col] = ns.val;
          continue;
        }
        const hs = findHiddenSingle(b, candidates);
        if (hs) {
          b[hs.row][hs.col] = hs.val;
          continue;
        }
      }
    }

    if (maxLevel >= LEVEL.BOX_LINE) {
      if (applyBoxLineReduction(candidates)) {
        highestLevel = Math.max(highestLevel, LEVEL.BOX_LINE);
        const ns = findNakedSingle(candidates);
        if (ns) {
          b[ns.row][ns.col] = ns.val;
          continue;
        }
        const hs = findHiddenSingle(b, candidates);
        if (hs) {
          b[hs.row][hs.col] = hs.val;
          continue;
        }
      }
    }

    return { solved: false, highestLevel };
  }

  return { solved: false, highestLevel };
}

const boxNames = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

export function getHint(board) {
  const candidates = getCandidates(board);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0 && candidates[r][c] && candidates[r][c].size === 0) {
        return {
          row: r, col: c, val: null,
          technique: 'error',
          message: `There's a problem! Row ${r + 1}, column ${c + 1} has no possible numbers. Try fixing any incorrect numbers first.`,
          highlightCells: [[r, c]],
        };
      }
    }
  }

  const ns = findNakedSingle(candidates);
  if (ns) {
    const reasonCells = [];
    const peers = getPeers(ns.row, ns.col);
    for (const [pr, pc] of peers) {
      if (board[pr][pc] !== 0) {
        reasonCells.push([pr, pc]);
      }
    }

    const eliminated = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== ns.val);
    return {
      row: ns.row, col: ns.col, val: ns.val,
      technique: 'naked_single',
      message: `Look at row ${ns.row + 1}, column ${ns.col + 1}. The numbers ${eliminated.join(', ')} are already used in its row, column, or box. The only possible number here is ${ns.val}.`,
      highlightCells: reasonCells,
    };
  }

  const hs = findHiddenSingleWithDetails(board, candidates);
  if (hs) return hs;

  return null;
}

function findHiddenSingleWithDetails(board, candidates) {
  for (let r = 0; r < 9; r++) {
    for (let num = 1; num <= 9; num++) {
      if (board[r].includes(num)) continue;
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push(c);
        }
      }
      if (positions.length === 1) {
        const col = positions[0];
        const reasonCells = [];
        for (let c = 0; c < 9; c++) {
          if (c !== col && board[r][c] !== 0) {
            reasonCells.push([r, c]);
          }
        }
        return {
          row: r, col, val: num,
          technique: 'hidden_single',
          message: `In row ${r + 1}, the number ${num} can only go in one place — column ${col + 1}. Every other empty cell in this row already has ${num} blocked by its column or box.`,
          highlightCells: reasonCells,
        };
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    for (let num = 1; num <= 9; num++) {
      let found = false;
      for (let r = 0; r < 9; r++) {
        if (board[r][c] === num) { found = true; break; }
      }
      if (found) continue;
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (candidates[r][c] && candidates[r][c].has(num)) {
          positions.push(r);
        }
      }
      if (positions.length === 1) {
        const row = positions[0];
        const reasonCells = [];
        for (let r = 0; r < 9; r++) {
          if (r !== row && board[r][c] !== 0) {
            reasonCells.push([r, c]);
          }
        }
        return {
          row, col: c, val: num,
          technique: 'hidden_single',
          message: `In column ${c + 1}, the number ${num} can only go in one place — row ${row + 1}. Every other empty cell in this column already has ${num} blocked by its row or box.`,
          highlightCells: reasonCells,
        };
      }
    }
  }

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      for (let num = 1; num <= 9; num++) {
        let found = false;
        const positions = [];
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            if (board[r][c] === num) { found = true; break; }
            if (candidates[r][c] && candidates[r][c].has(num)) {
              positions.push([r, c]);
            }
          }
          if (found) break;
        }
        if (found) continue;
        if (positions.length === 1) {
          const [row, col] = positions[0];
          const bName = boxNames[boxR][boxC];
          const reasonCells = [];
          for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
            for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
              if ((r !== row || c !== col) && board[r][c] !== 0) {
                reasonCells.push([r, c]);
              }
            }
          }
          return {
            row, col, val: num,
            technique: 'hidden_single',
            message: `In the ${bName} box, the number ${num} can only go in one cell — row ${row + 1}, column ${col + 1}. All other empty cells in this box have ${num} blocked by their row or column.`,
            highlightCells: reasonCells,
          };
        }
      }
    }
  }

  return null;
}
