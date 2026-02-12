import { useState, useCallback, useEffect, useRef } from 'react'
import Window from './components/Window'
import Board from './components/Board'
import NumberPad from './components/NumberPad'
import Controls from './components/Controls'
import Timer from './components/Timer'
import MistakeCounter from './components/MistakeCounter'
import DifficultyModal from './components/DifficultyModal'
import WinModal from './components/WinModal'
import GameOverModal from './components/GameOverModal'
import HintPanel from './components/HintPanel'
import CoinAnimation from './components/CoinAnimation'
import WinCoinCelebration from './components/WinCoinCelebration'
import PixelCat from './components/PixelCat'
import { generatePuzzle, getConflicts } from './utils/generator'
import { getHint } from './utils/solver'
import { saveGame, loadGame, clearSave, hasSavedGame } from './utils/storage'
import { playSound, toggleMute, isMuted } from './utils/sounds'

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
  // Clear from same row
  for (let c = 0; c < 9; c++) {
    newNotes[row][c].delete(num);
  }
  // Clear from same column
  for (let r = 0; r < 9; r++) {
    newNotes[r][col].delete(num);
  }
  // Clear from same box
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
  const [game, setGame] = useState(() => {
    const saved = loadGame();
    return saved || initGame('medium');
  });
  const [showDifficulty, setShowDifficulty] = useState(() => !loadGame());
  const [showWin, setShowWin] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hint, setHint] = useState(null);
  const [coins, setCoins] = useState([]);
  const [catMood, setCatMood] = useState('idle');
  const [muted, setMuted] = useState(() => isMuted());
  const coinIdRef = useRef(0);
  const catMoodTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

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

  const handleCellClick = useCallback((r, c) => {
    if (game.won || game.gameOver) return;
    playSound('click');
    setGame(g => ({ ...g, selectedCell: [r, c] }));
  }, [game.won, game.gameOver]);

  const spawnCoin = useCallback((row, col) => {
    const cell = document.querySelector(`.board .cell:nth-child(${row * 9 + col + 1})`);
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const id = coinIdRef.current++;
    setCoins(prev => [...prev, { id, x: rect.left + rect.width / 2 - 14, y: rect.top }]);
    setTimeout(() => {
      setCoins(prev => prev.filter(c => c.id !== id));
    }, 900);
  }, []);

  const handleNumber = useCallback((num) => {
    if (!game.selectedCell || game.won || game.gameOver) return;
    const [r, c] = game.selectedCell;
    if (game.givenCells[r][c]) return;
    setHint(null);

    // Spawn coin and cat reaction if correct (check before setGame)
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

        // Auto-clear related notes
        let newNotes = clearRelatedNotes(g.notes, r, c, num);
        newNotes[r][c] = new Set();

        // Check for mistake
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
    // Get tutorial-style hint from solver
    const hintResult = getHint(game.board);
    if (hintResult) {
      setHint(hintResult);
      if (hintResult.row !== null && hintResult.col !== null) {
        setGame(g => ({ ...g, selectedCell: [hintResult.row, hintResult.col] }));
      }
    } else {
      // Fallback: reveal a random cell from solution
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
    setGame(g => ({ ...g, won: false, isRunning: false }));
  }, []);

  const handleSelectDifficulty = useCallback((difficulty) => {
    clearSave();
    setShowDifficulty(false);
    setGame(initGame(difficulty));
  }, []);

  const handleResume = useCallback(() => {
    const saved = loadGame();
    if (saved) {
      setGame(saved);
      setShowDifficulty(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setShowGameOver(false);
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

  // Win detection effect
  useEffect(() => {
    if (game.won && !showWin) {
      setShowWin(true);
      setCatMood('celebrate');
      playSound('win');
    }
  }, [game.won, showWin]);

  // Game over detection effect
  useEffect(() => {
    if (game.gameOver && !showGameOver) {
      setShowGameOver(true);
      setCatMood('scared');
      playSound('gameOver');
    }
  }, [game.gameOver, showGameOver]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDifficulty || showWin || showGameOver) return;

      const { selectedCell } = game;
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        handleNumber(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase();
      } else if (e.key === 'ArrowUp' && r > 0) {
        setGame(g => ({ ...g, selectedCell: [r - 1, c] }));
      } else if (e.key === 'ArrowDown' && r < 8) {
        setGame(g => ({ ...g, selectedCell: [r + 1, c] }));
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setGame(g => ({ ...g, selectedCell: [r, c - 1] }));
      } else if (e.key === 'ArrowRight' && c < 8) {
        setGame(g => ({ ...g, selectedCell: [r, c + 1] }));
      } else if (e.key === 'n' || e.key === 'N') {
        handleToggleNotes();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, showDifficulty, showWin, showGameOver, handleNumber, handleErase, handleToggleNotes, handleUndo, handleRedo]);

  return (
    <div className="app">
      <Window title="Catdoku" color="var(--orange)" className="app-main-window">
        <div className="status-bar">
          <span className={`difficulty-badge difficulty-${game.difficulty}`}>
            {game.difficulty}
          </span>
          <MistakeCounter mistakes={game.mistakes} maxMistakes={MAX_MISTAKES} />
          <Timer seconds={game.seconds} isRunning={game.isRunning} onTick={handleTick} />
          <button
            className="mute-btn"
            onClick={() => setMuted(toggleMute())}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {hint && (
          <HintPanel hint={hint} onDismiss={dismissHint} onApply={applyHint} />
        )}

        <div className="game-layout" style={{ marginTop: 12 }}>
          <div className="game-board-section">
            <Board
              board={game.board}
              notes={game.notes}
              givenCells={game.givenCells}
              selectedCell={game.selectedCell}
              conflicts={conflicts}
              hint={hint}
              onCellClick={handleCellClick}
            />
          </div>

          <div className="game-sidebar">
            <Window title="Numbers" color="var(--blue)">
              <NumberPad
                onNumber={handleNumber}
                onErase={handleErase}
                notesMode={game.notesMode}
              />
            </Window>

            <Window title="Tools" color="var(--yellow)">
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
            </Window>
          </div>
        </div>
        <PixelCat mood={catMood} />
      </Window>

      {showDifficulty && (
        <DifficultyModal
          onSelect={handleSelectDifficulty}
          onClose={() => !game.won && !game.gameOver && setShowDifficulty(false)}
          hasSave={hasSavedGame()}
          onResume={handleResume}
        />
      )}

      {showWin && (
        <WinModal
          time={game.seconds}
          onNewGame={handleNewGame}
          onClose={() => {
            setShowWin(false);
            setGame(g => ({ ...g, won: false }));
          }}
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
    </div>
  );
}
