// Sudoku puzzle generator with technique-based difficulty grading

import { solve, LEVEL } from './solver.js';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Check uniqueness via brute-force (still needed as a safety check)
function countSolutions(board, limit = 2) {
  let count = 0;
  function doSolve(b) {
    if (count >= limit) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              doSolve(b);
              b[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  doSolve(board);
  return count;
}

// Difficulty → max technique level allowed
const difficultyLevels = {
  easy: LEVEL.NAKED_SINGLE,
  medium: LEVEL.HIDDEN_SINGLE,
  hard: LEVEL.BOX_LINE,
};

// Target clue ranges per difficulty (min clues to keep puzzles reasonable)
const clueTargets = {
  easy: { min: 36, max: 45 },
  medium: { min: 28, max: 36 },
  hard: { min: 22, max: 30 },
};

export function generatePuzzle(difficulty = 'medium') {
  const maxLevel = difficultyLevels[difficulty] || LEVEL.HIDDEN_SINGLE;
  const target = clueTargets[difficulty] || clueTargets.medium;

  // Try multiple times to find a good puzzle
  for (let attempt = 0; attempt < 20; attempt++) {
    // Generate a complete solved board
    const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    solveSudoku(solution);

    // Copy for the puzzle
    const puzzle = solution.map(row => [...row]);

    // Shuffle positions for random removal
    const positions = shuffleArray(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
    );

    let clueCount = 81;

    for (const [row, col] of positions) {
      if (clueCount <= target.min) break;

      const backup = puzzle[row][col];
      puzzle[row][col] = 0;

      // Quick uniqueness check first
      const copy = puzzle.map(r => [...r]);
      if (countSolutions(copy, 2) !== 1) {
        puzzle[row][col] = backup;
        continue;
      }

      // Check if solvable with allowed techniques
      const puzzleCopy = puzzle.map(r => [...r]);
      const result = solve(puzzleCopy, maxLevel);

      if (result.solved) {
        clueCount--;
      } else {
        // Requires harder techniques — put it back
        puzzle[row][col] = backup;
      }
    }

    // Check if we removed enough cells
    if (clueCount <= target.max) {
      return { puzzle, solution };
    }
  }

  // Fallback: return whatever we have from last attempt
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(solution);
  const puzzle = solution.map(row => [...row]);
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let removed = 0;
  const fallbackRemove = difficulty === 'easy' ? 36 : difficulty === 'hard' ? 50 : 45;
  for (const [row, col] of positions) {
    if (removed >= fallbackRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    const copy = puzzle.map(r => [...r]);
    if (countSolutions(copy, 2) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

export function getConflicts(board, row, col, num) {
  if (num === 0) return [];
  const conflicts = [];
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === num) conflicts.push([row, i]);
    if (i !== row && board[i][col] === num) conflicts.push([i, col]);
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (i !== row && j !== col && board[i][j] === num) {
        if (!conflicts.some(([r, c]) => r === i && c === j)) {
          conflicts.push([i, j]);
        }
      }
    }
  }
  return conflicts;
}
