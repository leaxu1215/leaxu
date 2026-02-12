import './CatFaceIcon.css'

// Color palette matching the main pixel cat
const C = {
  B: '#3d2511',   // dark brown outline
  O: '#f0921e',   // orange
  W: '#ffffff',   // white
  E: '#1a1a2e',   // eye dark
  K: '#ff9eaa',   // rosy cheeks
  N: '#ff7eb3',   // pink nose/tongue
  P: '#ffb4b4',   // pink inner ear
  T: '#87ceeb',   // tear / sweat (light blue)
};

function parseGrid(rows) {
  const pixels = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.' && C[ch]) {
        pixels.push([x, y, C[ch]]);
      }
    });
  });
  return pixels;
}

function buildShadow(pixels) {
  return pixels
    .map(([x, y, color]) => `${x}px ${y}px 0 0 ${color}`)
    .join(', ');
}

// 10x9 pixel cat face grids (10 wide, 9 tall)
const faces = {
  normal: parseGrid([
    //0123456789
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOEWOBWEOБ',
    'BOOOOBOOOB',
    'BOKOONOOKB',
    'BOOOOOOOOB',
    '.BBBBBBBB.',
  ].map(r => r.replace('Б','B'))),

  happy: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOBOBOOBOB',
    'BOKOOKOOKB',
    'BOOONNOOOБ',
    'BOOOOOOOOB',
    '.BBBBBBBB.',
  ].map(r => r.replace('Б','B'))),

  wink: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOEWOBBOOB',
    'BOOOOBOOOB',
    'BOKOONOOKB',
    'BOOONOOOOB',
    '.BBBBBBBB.',
  ]),

  scared: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOEWOBWEOB',
    'BOEWOBWEOB',
    'BOKOOOKOB.',
    'BOOBWWBOOB',
    '.BBBBBBBB.',
  ]),

  love: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BONOBBONOБ',
    'BOONBBNOOB',
    'BOOOOBOOOB',
    'BOKOOKOOKB',
    'BOOOOOOOOB',
    '.BBBBBBBB.',
  ].map(r => r.replace('Б','B'))),

  sad: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOEOOBOEOБ',
    'BOOOOBOOOB',
    'BOOONOOOOB',
    'BOOBOOBOOB',
    '.BBBBBBBBT',
  ].map(r => r.replace('Б','B'))),

  angry: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOBOOOOBOB',
    'BOOEOBEOOB',
    'BOOOOBOOOB',
    'BOOONOOOOB',
    'BOOBOOBOOB',
    '.BBBBBBBB.',
  ]),

  sleepy: parseGrid([
    '.B......B.',
    'BPOB..BOPB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOOOOOOOOB',
    'BOBBOOBBOB',
    'BOKOONOOKB',
    'BOOOOOOOOB',
    '.BBBBBBBB.',
  ]),
};

// Pre-build all shadows
const FACE_SHADOWS = {};
for (const [name, pixels] of Object.entries(faces)) {
  FACE_SHADOWS[name] = buildShadow(pixels);
}

export default function CatFaceIcon({ expression = 'normal', size = 16 }) {
  const scale = size / 10;
  const shadow = FACE_SHADOWS[expression] || FACE_SHADOWS.normal;

  return (
    <span
      className="cat-face-icon"
      style={{ width: size, height: size }}
    >
      <span
        className="cat-face-pixel"
        style={{
          boxShadow: shadow,
          transform: `scale(${scale})`,
        }}
      />
    </span>
  );
}
