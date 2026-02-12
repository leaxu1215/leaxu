import CatFaceIcon from './CatFaceIcon'
import './Window.css'

export default function Window({ title, color = 'var(--orange)', children, className = '', icon }) {
  return (
    <div className={`retro-window ${className}`}>
      <div className="retro-window-titlebar" style={{ background: color }}>
        <span className="retro-window-icon">
          {icon || <CatFaceIcon expression="normal" size={16} />}
        </span>
        <span className="retro-window-title">{title}</span>
        <div className="retro-window-buttons">
          <span className="retro-btn-min">○</span>
          <span className="retro-btn-max">_</span>
          <span className="retro-btn-close">✕</span>
        </div>
      </div>
      <div className="retro-window-content">
        {children}
      </div>
    </div>
  )
}
