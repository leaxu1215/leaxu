import { useEffect, useState } from 'react'
import './CoinAnimation.css'

export default function CoinAnimation({ coins }) {
  return (
    <div className="coin-container">
      {coins.map(coin => (
        <CoinSprite key={coin.id} x={coin.x} y={coin.y} />
      ))}
    </div>
  );
}

function CoinSprite({ x, y }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="coin" style={{ left: x, top: y }}>
      <span className="coin-icon">🪙</span>
      <span className="coin-text">+1</span>
    </div>
  );
}
