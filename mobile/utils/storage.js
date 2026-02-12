// AsyncStorage save/load for Catdoku game state

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'catdoku-save';

export async function saveGame(gameState) {
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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    // AsyncStorage may fail silently
  }
}

export async function loadGame() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      ...data,
      notes: data.notes.map(row =>
        row.map(cell => new Set(cell))
      ),
      history: [],
      future: [],
      isRunning: !data.won && !data.gameOver,
    };
  } catch (e) {
    return null;
  }
}

export async function clearSave() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export async function hasSavedGame() {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val !== null;
  } catch (e) {
    return false;
  }
}
