import './MistakeCounter.css'

export default function MistakeCounter({ mistakes, maxMistakes }) {
  return (
    <div className="mistake-counter">
      {Array.from({ length: maxMistakes }, (_, i) => (
        <span key={i} className={`heart ${i < maxMistakes - mistakes ? 'heart-full' : 'heart-empty'}`}>
          {i < maxMistakes - mistakes ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}
