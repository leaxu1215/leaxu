import { useState, useEffect, useRef, useCallback } from 'react'
import { playSound } from '../utils/sounds'
import './PixelCat.css'

// Color palette - warm & cute
const colorMap = {
  'B': '#3d2511',   // dark brown outline
  'O': '#f0921e',   // orange body
  'L': '#f8b84e',   // light orange
  'P': '#ffb4b4',   // pink inner ear
  'E': '#1a1a2e',   // eye dark
  'W': '#ffffff',   // white (shine, belly, paws)
  'K': '#ff9eaa',   // rosy cheeks
  'N': '#ff7eb3',   // pink nose
  'D': '#d4781a',   // darker orange (shading)
};

function parseGrid(rows) {
  const pixels = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.' && colorMap[ch]) {
        pixels.push([x, y, colorMap[ch]]);
      }
    });
  });
  return pixels;
}

function buildFrame(pixels) {
  return pixels
    .map(([x, y, color]) => `${x}px ${y}px 0 0 ${color}`)
    .join(', ');
}

// ---- Frame definitions as grids ----
// Each row is exactly 16 chars wide

const catPixels = {
  idle1: parseGrid([
    //0123456789ABCDEF
    '....B.....B.....',  // ear tips
    '...BOB...BOB....',  // ears
    '..BOPOB.BOPOB...',  // ears + pink
    '..BOOOOOOOOOOB..',  // head top
    '.BOOOOOOOOOOOB..',  // forehead
    '.BOOEEOOOEEOOB..',  // eyes (2px wide each)
    '.BOOEWOOOEWOOB..',  // eyes + white shine
    '.BOKOOONOOOKOB..',  // cheeks + nose
    '..BOOOOOOOOOOB..',  // chin
    '..BOOOOOOOOOOB..',  // neck
    '.BOOWWWWWWOOOB..',  // upper belly
    '.BOWWWWWWWWWOB..',  // belly (wide white)
    '.BOOWWWWWWOOOB..',  // lower belly
    '.BBWWBOOOOBWWBB.',  // paws
    '..BWB......BWB..',  // feet
  ]),

  idle2: parseGrid([  // blink
    '....B.....B.....',
    '...BOB...BOB....',
    '..BOPOB.BOPOB...',
    '..BOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',  // eyes gone (blink)
    '.BOOBBOOOBBOB...',  // closed eyes (lines)
    '.BOKOOONOOOKOB..',
    '..BOOOOOOOOOOB..',
    '..BOOOOOOOOOOB..',
    '.BOOWWWWWWOOOB..',
    '.BOWWWWWWWWWOB..',
    '.BOOWWWWWWOOOB..',
    '.BBWWBOOOOBWWBB.',
    '..BWB......BWB..',
  ]),

  happy: parseGrid([  // jumped up, happy eyes ^_^
    '....B.....B.....',
    '...BOB...BOB....',
    '..BOPOB.BOPOB...',
    '..BOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',
    '.BOOBOBOOBOBOB..',  // ^_^ eyes
    '.BOKOOONOOOKOB..',  // cheeks + nose
    '..BOOOOOOOOOOB..',
    '..BOOOOOOOOOOB..',
    '.BOOWWWWWWOOOB..',
    '.BOWWWWWWWWWOB..',  // belly
    'BBWWBOOOOBWWBB..',  // paws (stretched wider)
    '.BWB......BWB...',
    '................',
    '................',
  ]),

  upset: parseGrid([  // flat ears, sad
    '................',
    '.BB.......BB....',  // flat ears
    'BOPB.....BOPB...',
    '.BOOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',
    '.BOOEEOOOEEOOB..',  // worried eyes
    '.BOOOEOOOEOOOB..',  // eyes looking down
    '.BOOOOONOOOOOB..',  // no cheeks (sad)
    '..BOOOOOOOOOOB..',
    '..BOOOOOOOOOOB..',
    '.BOOWWWWWWOOOB..',
    '.BOWWWWWWWWWOB..',
    '.BOOWWWWWWOOOB..',
    '.BBWWBOOOOBWWBB.',
    '..BWB......BWB..',
  ]),

  sleep: parseGrid([  // curled up
    '................',
    '................',
    '................',
    '................',
    '...BBBBBBBBB....',  // top curve
    '..BOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',
    '.BOOOOOOOOOOOOB.',
    '.BOWWWWWWWWWWOB.',  // white belly visible
    '.BOWWWWWWWWWWOB.',
    '.BOBBOONOOBBOOB.',  // closed eyes + nose on side
    '..BOOOOOOOOOOB..',
    '..BBBBBBBBBBBB..',  // bottom
    '................',
    '................',
  ]),

  celebrate1: parseGrid([  // lean left
    '...B.....B......',
    '..BOB...BOB.....',
    '.BOPOB.BOPOB....',
    '.BOOOOOOOOOOB...',
    'BOOOOOOOOOOOB...',
    'BOOBOBOOBOBOB...',  // happy eyes
    'BOKOOONOOOKOB...',
    '.BOOOOOOOOOOB...',
    '.BOOOOOOOOOOB...',
    'BOOWWWWWWOOOB...',
    'BOWWWWWWWWWOB...',
    'BOOWWWWWWOOOB...',
    'BBWWBOOOOBWWBB..',
    '.BWB......BWB...',
    '................',
  ]),

  celebrate2: parseGrid([  // lean right
    '......B.....B...',
    '.....BOB...BOB..',
    '....BOPOB.BOPOB.',
    '...BOOOOOOOOOOB.',
    '...BOOOOOOOOOOOB',
    '...BOOBOBOOBOBOB',
    '...BOKOOONOOOKOB',
    '...BOOOOOOOOOOB.',
    '...BOOOOOOOOOOB.',
    '...BOOWWWWWWOOOB',
    '...BOWWWWWWWWWOB',
    '...BOOWWWWWWOOOB',
    '..BBWWBOOOOBWWBB',
    '...BWB......BWB.',
    '................',
  ]),

  scared: parseGrid([  // wide eyes, paws over mouth
    '....B.....B.....',
    '...BOB...BOB....',
    '..BOPOB.BOPOB...',
    '..BOOOOOOOOOOB..',
    '.BOOOOOOOOOOOB..',
    '.BOOEEOOOEEOOB..',  // big scared eyes
    '.BOOEWOOOEWOOB..',  // extra shine = scared
    '.BOWWWWWWWWWWOB..',  // paws covering mouth
    '..BOOOOOOOOOOB..',
    '..BOOOOOOOOOOB..',
    '.BOOWWWWWWOOOB..',
    '.BOWWWWWWWWWOB..',
    '.BOOWWWWWWOOOB..',
    '.BBBBBBBBBBBBBB.',
    '................',
  ]),
};

// Add tail pixels to appropriate frames
const tailRight = [[14,10,'#3d2511'],[14,11,'#f0921e'],[15,9,'#3d2511'],[15,10,'#f0921e'],[15,11,'#3d2511'],[16,9,'#3d2511']];
const tailUp = [[14,9,'#3d2511'],[14,10,'#f0921e'],[15,8,'#3d2511'],[15,9,'#f0921e'],[16,7,'#3d2511'],[16,8,'#f0921e'],[17,7,'#3d2511']];
const tailDown = [[14,12,'#3d2511'],[14,11,'#f0921e'],[15,12,'#f0921e'],[15,13,'#3d2511'],[16,13,'#3d2511']];

catPixels.idle1.push(...tailRight);
catPixels.idle2.push(...tailUp);
catPixels.happy.push(...tailUp);
catPixels.upset.push(...tailDown);
catPixels.celebrate1.push(...tailUp);
catPixels.celebrate2.push(...tailUp);
catPixels.scared.push(...tailDown);
// sleep: tail wraps around (already in grid or add separately)
catPixels.sleep.push([14,9,'#3d2511'],[14,10,'#f0921e'],[15,10,'#3d2511'],[15,9,'#f0921e'],[16,9,'#3d2511']);

// Pre-build all frames
const FRAMES = {};
for (const [name, pixels] of Object.entries(catPixels)) {
  FRAMES[name] = buildFrame(pixels);
}

const SPEECH = {
  happy: ['Nya~!', 'Meow!', 'Purrfect!', 'Yay!', 'Nyaa!!'],
  upset: ['Mew...', 'Oops!', 'Hmm...', 'Nya no!'],
  celebrate: ['Meow meow!!', 'Nyaa~!!', 'Purrfect!!'],
  scared: ['...', 'Mew...', 'Nyaa!?'],
};

const MOOD_ANIM_CLASS = {
  idle: '',
  happy: 'cat-bounce',
  upset: 'cat-shiver',
  sleep: 'cat-breathe',
  celebrate: 'cat-dance',
  scared: 'cat-tremble',
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PixelCat({ mood }) {
  const [frame, setFrame] = useState('idle1');
  const [bubble, setBubble] = useState(null);
  const [internalMood, setInternalMood] = useState('idle');
  const sleepTimerRef = useRef(null);
  const animTimerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const prevMoodRef = useRef(mood);

  // Handle mood changes from parent
  useEffect(() => {
    if (mood === prevMoodRef.current && mood === 'idle') return;
    prevMoodRef.current = mood;

    if (mood === 'idle') {
      setInternalMood('idle');
      return;
    }

    setInternalMood(mood);

    if (SPEECH[mood]) {
      setBubble(randomFrom(SPEECH[mood]));
      clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => setBubble(null), 2000);
    }
  }, [mood]);

  // Animation loop
  useEffect(() => {
    clearInterval(animTimerRef.current);
    clearTimeout(sleepTimerRef.current);

    if (internalMood === 'idle') {
      let tick = 0;
      setFrame('idle1');
      animTimerRef.current = setInterval(() => {
        tick++;
        if (tick % 10 === 0) {
          setFrame('idle2');
          setTimeout(() => setFrame('idle1'), 200);
        }
      }, 300);
      sleepTimerRef.current = setTimeout(() => setInternalMood('sleep'), 30000);

    } else if (internalMood === 'happy') {
      playSound('meow');
      setFrame('happy');
      animTimerRef.current = setTimeout(() => {
        setFrame('idle1');
        setInternalMood('idle');
      }, 1200);

    } else if (internalMood === 'upset') {
      playSound('mew');
      setFrame('upset');
      animTimerRef.current = setTimeout(() => {
        setFrame('idle1');
        setInternalMood('idle');
      }, 1500);

    } else if (internalMood === 'sleep') {
      setFrame('sleep');
      setBubble('Zzz');

    } else if (internalMood === 'celebrate') {
      let tick = 0;
      const cycle = () => {
        setFrame(tick % 2 === 0 ? 'celebrate1' : 'celebrate2');
        tick++;
        if (tick < 8) {
          animTimerRef.current = setTimeout(cycle, 350);
        } else {
          setFrame('idle1');
          setInternalMood('idle');
        }
      };
      cycle();

    } else if (internalMood === 'scared') {
      setFrame('scared');
      animTimerRef.current = setTimeout(() => {
        setFrame('idle1');
        setInternalMood('idle');
      }, 3000);
    }

    return () => {
      clearInterval(animTimerRef.current);
      clearTimeout(animTimerRef.current);
      clearTimeout(sleepTimerRef.current);
    };
  }, [internalMood]);

  // Wake from sleep
  useEffect(() => {
    if (internalMood === 'sleep' && mood !== 'idle') {
      setBubble(null);
      setInternalMood(mood);
    }
  }, [mood, internalMood]);

  const handleClick = useCallback(() => {
    if (internalMood === 'sleep') {
      playSound('mew');
      setBubble('Meow?');
      setInternalMood('idle');
      clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => setBubble(null), 1500);
    }
  }, [internalMood]);

  return (
    <div
      className={`pixel-cat-container ${MOOD_ANIM_CLASS[internalMood] || ''}`}
      onClick={handleClick}
    >
      {bubble && (
        <div className="cat-bubble">
          <span>{bubble}</span>
        </div>
      )}
      <div
        className="pixel-cat"
        style={{ boxShadow: FRAMES[frame] || FRAMES.idle1 }}
      />
    </div>
  );
}
