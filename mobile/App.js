import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Dimensions, Pressable, ScrollView } from 'react-native';
import Board from './components/Board';
import NumberPad from './components/NumberPad';
import Controls from './components/Controls';
import Timer from './components/Timer';
import MistakeCounter from './components/MistakeCounter';
import DifficultyModal from './components/DifficultyModal';
import WinModal from './components/WinModal';
import GameOverModal from './components/GameOverModal';
import HintPanel from './components/HintPanel';
import CoinAnimation from './components/CoinAnimation';
import WinCoinCelebration from './components/WinCoinCelebration';
import PixelCat from './components/PixelCat';
import { generatePuzzle, getConflicts } from './utils/generator';
import { getHint } from './utils/solver';
import { saveGame, loadGame, clearSave, hasSavedGame } from './utils/storage';
import { playSound, toggleMute, isMuted, initSounds } from './utils/sounds';

const MAX_MISTAKES = 3;

function createEmptyNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  );
}

function cloneNotes(notes) {
  return notes.map(row => row.map(cell => new Set(cell)));
}

function clearRelatedNotes(notes, row, col, num) {
  const newNotes = cloneNotes(notes);
  for (let c = 0; c < 9; c++) newNotes[row][c].delete(num);
  for (let r = 0; r < 9; r++) newNotes[r][col].delete(num);
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      newNotes[r][c].delete(num);
    }
  }
  return newNotes;
}

function initGame(difficulty = 'medium') {
  const { puzzle, solution } = generatePuzzle(difficulty);
  const givenCells = puzzle.map(row => row.map(v => v !== 0));
  return {
    board: puzzle.map(row => [...row]),
    solution,
    givenCells,
    notes: createEmptyNotes(),
    selectedCell: null,
    notesMode: false,
    history: [],
    future: [],
    seconds: 0,
    isRunning: true,
    difficulty,
    won: false,
    gameOver: false,
    mistakes: 0,
  };
}

export default function App() {
  const [game, setGame] = useState(() => initGame('medium'));
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hint, setHint] = useState(null);
  const [coins, setCoins] = useState([]);
  const [catMood, setCatMood] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const coinIdRef = useRef(0);
  const catMoodTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Initialize sounds and check for saved game
  useEffect(() => {
    (async () => {
      await initSounds();
      setMuted(isMuted());
      const saved = await hasSavedGame();
      setHasSave(saved);
      if (saved) {
        const gameData = await loadGame();
        if (gameData) {
          setGame(gameData);
        }
      }
    })();
  }, []);

  // Save game state on changes (debounced)
  useEffect(() => {
    if (game.won || game.gameOver) {
      clearSave();
      return;
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!showDifficulty) {
        saveGame(game);
      }
    }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [game, showDifficulty]);

  const conflicts = (() => {
    if (!game.selectedCell) return [];
    const [r, c] = game.selectedCell;
    const val = game.board[r][c];
    return getConflicts(game.board, r, c, val);
  })();

  const checkWin = useCallback((board, solution) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }, []);

  const handleCellPress = useCallback((r, c) => {
    if (game.won || game.gameOver) return;
    playSound('click');
    setGame(g => ({ ...g, selectedCell: [r, c] }));
  }, [game.won, game.gameOver]);

  const spawnCoin = useCallback((row, col) => {
    const screenWidth = Dimensions.get('window').width;
    const cellSize = Math.floor((screenWidth - 40) / 9);
    const x = col * cellSize + 20 + cellSize / 2 - 14;
    const y = row * cellSize + 100;
    const id = coinIdRef.current++;
    setCoins(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setCoins(prev => prev.filter(c => c.id !== id));
    }, 900);
  }, []);

  const handleNumber = useCallback((num) => {
    if (!game.selectedCell || game.won || game.gameOver) return;
    const [r, c] = game.selectedCell;
    if (game.givenCells[r][c]) return;
    setHint(null);

    if (!game.notesMode && num === game.solution[r][c]) {
      playSound('coin');
      spawnCoin(r, c);
      setCatMood('happy');
      clearTimeout(catMoodTimerRef.current);
      catMoodTimerRef.current = setTimeout(() => setCatMood('idle'), 1500);
    } else if (!game.notesMode) {
      playSound('error');
      setCatMood('upset');
      clearTimeout(catMoodTimerRef.current);
      catMoodTimerRef.current = setTimeout(() => setCatMood('idle'), 1800);
    } else {
      playSound('click');
    }

    setGame(g => {
      if (g.notesMode) {
        const newNotes = cloneNotes(g.notes);
        if (newNotes[r][c].has(num)) {
          newNotes[r][c].delete(num);
        } else {
          newNotes[r][c].add(num);
        }
        return {
          ...g,
          notes: newNotes,
          history: [...g.history, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
          future: [],
        };
      } else {
        const newBoard = g.board.map(row => [...row]);
        newBoard[r][c] = num;

        let newNotes = clearRelatedNotes(g.notes, r, c, num);
        newNotes[r][c] = new Set();

        const isCorrect = num === g.solution[r][c];
        const newMistakes = isCorrect ? g.mistakes : g.mistakes + 1;
        const isGameOver = newMistakes >= MAX_MISTAKES;
        const won = isCorrect && checkWin(newBoard, g.solution);

        return {
          ...g,
          board: newBoard,
          notes: newNotes,
          history: [...g.history, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
          future: [],
          mistakes: newMistakes,
          won,
          gameOver: isGameOver,
          isRunning: (won || isGameOver) ? false : g.isRunning,
        };
      }
    });
  }, [game.selectedCell, game.won, game.gameOver, game.givenCells, game.notesMode, game.solution, checkWin, spawnCoin]);

  const handleErase = useCallback(() => {
    if (!game.selectedCell || game.won || game.gameOver) return;
    const [r, c] = game.selectedCell;
    if (game.givenCells[r][c]) return;
    playSound('erase');
    setHint(null);

    setGame(g => {
      const newBoard = g.board.map(row => [...row]);
      newBoard[r][c] = 0;
      const newNotes = cloneNotes(g.notes);
      newNotes[r][c] = new Set();
      return {
        ...g,
        board: newBoard,
        notes: newNotes,
        history: [...g.history, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
        future: [],
      };
    });
  }, [game.selectedCell, game.won, game.gameOver, game.givenCells]);

  const handleUndo = useCallback(() => {
    playSound('undo');
    setGame(g => {
      if (g.history.length === 0) return g;
      const prev = g.history[g.history.length - 1];
      return {
        ...g,
        board: prev.board,
        notes: prev.notes,
        mistakes: prev.mistakes,
        history: g.history.slice(0, -1),
        future: [...g.future, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
        gameOver: false,
        isRunning: true,
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    playSound('undo');
    setGame(g => {
      if (g.future.length === 0) return g;
      const next = g.future[g.future.length - 1];
      const isGameOver = next.mistakes >= MAX_MISTAKES;
      return {
        ...g,
        board: next.board,
        notes: next.notes,
        mistakes: next.mistakes,
        history: [...g.history, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
        future: g.future.slice(0, -1),
        gameOver: isGameOver,
        isRunning: isGameOver ? false : true,
      };
    });
  }, []);

  const handleHint = useCallback(() => {
    if (game.won || game.gameOver) return;
    playSound('hint');
    const hintResult = getHint(game.board);
    if (hintResult) {
      setHint(hintResult);
      if (hintResult.row !== null && hintResult.col !== null) {
        setGame(g => ({ ...g, selectedCell: [hintResult.row, hintResult.col] }));
      }
    } else {
      const candidates = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!game.givenCells[r][c] && game.board[r][c] !== game.solution[r][c]) {
            candidates.push([r, c]);
          }
        }
      }
      if (candidates.length > 0) {
        const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
        setHint({
          row: r, col: c, val: game.solution[r][c],
          technique: 'fallback',
          message: `This one's tricky! The answer for row ${r + 1}, column ${c + 1} is ${game.solution[r][c]}.`,
          highlightCells: [],
        });
        setGame(g => ({ ...g, selectedCell: [r, c] }));
      }
    }
  }, [game.won, game.gameOver, game.board, game.givenCells, game.solution]);

  const dismissHint = useCallback(() => {
    setHint(null);
  }, []);

  const applyHint = useCallback(() => {
    if (!hint || hint.val === null) return;
    const { row: r, col: c, val: num } = hint;
    playSound('coin');
    spawnCoin(r, c);
    setGame(g => {
      const newBoard = g.board.map(row => [...row]);
      newBoard[r][c] = num;
      let newNotes = clearRelatedNotes(g.notes, r, c, num);
      newNotes[r][c] = new Set();
      const won = checkWin(newBoard, g.solution);
      return {
        ...g,
        board: newBoard,
        notes: newNotes,
        selectedCell: [r, c],
        history: [...g.history, { board: g.board.map(row => [...row]), notes: cloneNotes(g.notes), mistakes: g.mistakes }],
        future: [],
        won,
        isRunning: won ? false : g.isRunning,
      };
    });
    setHint(null);
  }, [hint, checkWin, spawnCoin]);

  const handleToggleNotes = useCallback(() => {
    playSound('noteToggle');
    setGame(g => ({ ...g, notesMode: !g.notesMode }));
  }, []);

  const handleNewGame = useCallback(() => {
    setHint(null);
    setShowWin(false);
    setShowGameOver(false);
    setShowDifficulty(true);
    setGame(g => ({ ...g, isRunning: false }));
  }, []);

  const handleSelectDifficulty = useCallback((difficulty) => {
    clearSave();
    setShowDifficulty(false);
    setHasSave(false);
    setGame(initGame(difficulty));
    setCatMood('idle');
  }, []);

  const handleResume = useCallback(async () => {
    const saved = await loadGame();
    if (saved) {
      setGame(saved);
      setShowDifficulty(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setShowGameOver(false);
    setCatMood('idle');
    setGame(g => {
      const puzzle = g.solution.map((row, r) =>
        row.map((val, c) => g.givenCells[r][c] ? val : 0)
      );
      return {
        ...g,
        board: puzzle,
        notes: createEmptyNotes(),
        selectedCell: null,
        notesMode: false,
        history: [],
        future: [],
        seconds: 0,
        isRunning: true,
        won: false,
        gameOver: false,
        mistakes: 0,
      };
    });
  }, []);

  const handleTick = useCallback(() => {
    setGame(g => ({ ...g, seconds: g.seconds + 1 }));
  }, []);

  // Win detection
  useEffect(() => {
    if (game.won && !showWin) {
      setShowWin(true);
      setCatMood('celebrate');
      playSound('win');
    }
  }, [game.won, showWin]);

  // Game over detection
  useEffect(() => {
    if (game.gameOver && !showGameOver) {
      setShowGameOver(true);
      setCatMood('scared');
      playSound('gameOver');
    }
  }, [game.gameOver, showGameOver]);

  const handleToggleMute = useCallback(async () => {
    const newMuted = await toggleMute();
    setMuted(newMuted);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#c4b8a8" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Catdoku</Text>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.difficultyBadge, styles[`difficulty_${game.difficulty}`]]}>
            <Text style={styles.difficultyText}>{game.difficulty.toUpperCase()}</Text>
          </View>
          <MistakeCounter mistakes={game.mistakes} maxMistakes={MAX_MISTAKES} />
          <Timer seconds={game.seconds} isRunning={game.isRunning} onTick={handleTick} />
          <Pressable style={styles.muteBtn} onPress={handleToggleMute}>
            <Text style={styles.muteBtnText}>{muted ? '🔇' : '🔊'}</Text>
          </Pressable>
        </View>

        {/* Hint Panel */}
        {hint && (
          <HintPanel hint={hint} onDismiss={dismissHint} onApply={applyHint} />
        )}

        {/* Board */}
        <Board
          board={game.board}
          notes={game.notes}
          givenCells={game.givenCells}
          selectedCell={game.selectedCell}
          conflicts={conflicts}
          hint={hint}
          onCellPress={handleCellPress}
        />

        {/* Cat */}
        <View style={styles.catContainer}>
          <PixelCat mood={catMood} />
        </View>

        {/* Number Pad */}
        <NumberPad onNumber={handleNumber} onErase={handleErase} />

        {/* Controls */}
        <Controls
          notesMode={game.notesMode}
          onToggleNotes={handleToggleNotes}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onHint={handleHint}
          onNewGame={handleNewGame}
          canUndo={game.history.length > 0}
          canRedo={game.future.length > 0}
        />
      </ScrollView>

      {/* Modals */}
      {showDifficulty && (
        <DifficultyModal
          onSelect={handleSelectDifficulty}
          onClose={() => !game.won && !game.gameOver && setShowDifficulty(false)}
          hasSave={hasSave}
          onResume={handleResume}
        />
      )}

      {showWin && (
        <WinModal
          time={game.seconds}
          onNewGame={handleNewGame}
          onClose={() => setShowWin(false)}
        />
      )}

      {showGameOver && (
        <GameOverModal
          mistakes={game.mistakes}
          onRetry={handleRetry}
          onNewGame={handleNewGame}
        />
      )}

      <CoinAnimation coins={coins} />
      <WinCoinCelebration active={showWin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c4b8a8',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d2d2d',
    letterSpacing: 1,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2d2d2d',
  },
  difficulty_easy: {
    backgroundColor: '#c8f7c5',
  },
  difficulty_medium: {
    backgroundColor: '#ffd166',
  },
  difficulty_hard: {
    backgroundColor: '#ffb4b4',
  },
  catContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  muteBtn: {
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  muteBtnText: {
    fontSize: 14,
  },
});
