import { useEffect, useState, useMemo } from 'react'
import './WinCoinCelebration.css'

export default function WinCoinCelebration({ active }) {
  const [phase, setPhase] = useState('idle'); // idle → shower → collect → done

  const coins = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,       // % from left
      startY: -10 - Math.random() * 30,   // above viewport
      delay: Math.random() * 0.8,         // stagger entry
      wobble: (Math.random() - 0.5) * 40, // horizontal drift
      size: 20 + Math.random() * 16,      // varied sizes
    }));
  }, [active]);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }
    setPhase('shower');
    const collectTimer = setTimeout(() => setPhase('collect'), 1400);
    const doneTimer = setTimeout(() => setPhase('done'), 2800);
    return () => {
      clearTimeout(collectTimer);
      clearTimeout(doneTimer);
    };
  }, [active]);

  if (!active || phase === 'idle') return null;

  return (
    <div className="win-coin-overlay">
      <div className={`pocket ${phase === 'collect' || phase === 'done' ? 'pocket-visible' : ''}`}>
        <span className="pocket-icon">👛</span>
        <span className="pocket-label">+30</span>
      </div>
      {phase !== 'done' && coins.map(coin => (
        <div
          key={coin.id}
          className={`win-coin ${phase === 'collect' ? 'win-coin-collect' : 'win-coin-fall'}`}
          style={{
            '--start-x': `${coin.startX}vw`,
            '--start-y': `${coin.startY}vh`,
            '--wobble': `${coin.wobble}px`,
            '--delay': `${coin.delay}s`,
            '--size': `${coin.size}px`,
          }}
        >
          🪙
        </div>
      ))}
    </div>
  );
}
