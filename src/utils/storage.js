// localStorage save/load for Sudoku game state

const STORAGE_KEY = 'sudoku-save';

export function saveGame(gameState) {
  try {
    const serializable = {
      board: gameState.board,
      solution: gameState.solution,
      givenCells: gameState.givenCells,
      notes: gameState.notes.map(row =>
        row.map(cell => [...cell])
      ),
      selectedCell: gameState.selectedCell,
      notesMode: gameState.notesMode,
      seconds: gameState.seconds,
      difficulty: gameState.difficulty,
      mistakes: gameState.mistakes,
      won: gameState.won,
      gameOver: gameState.gameOver,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    // localStorage may be full or unavailable
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      ...data,
      notes: data.notes.map(row =>
        row.map(cell => new Set(cell))
      ),
      // Restore runtime state
      history: [],
      future: [],
      isRunning: !data.won && !data.gameOver,
    };
  } catch (e) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export function hasSavedGame() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (e) {
    return false;
  }
}
