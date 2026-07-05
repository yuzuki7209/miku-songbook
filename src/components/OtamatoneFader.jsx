import { useRef } from 'react'
import { PROFICIENCY_LEVELS } from '../lib/proficiency'
import './OtamatoneFader.css'

// 오타마톤의 길쭉한 목(네크)을 흉내낸 페이더.
// onChange가 없으면 숙련도를 보여주기만 하는 읽기 전용 모드로 동작한다.
function OtamatoneFader({ value, onChange, size = 'md' }) {
  const trackRef = useRef(null)
  const interactive = typeof onChange === 'function'
  const currentIndex = Math.max(
    0,
    PROFICIENCY_LEVELS.findIndex((level) => level.id === value),
  )
  const lastIndex = PROFICIENCY_LEVELS.length - 1
  const percent = (currentIndex / lastIndex) * 100

  const moveToClientX = (clientX) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const nearest = Math.round(ratio * lastIndex)
    const level = PROFICIENCY_LEVELS[nearest]
    if (level.id !== value) onChange(level.id)
  }

  const handleKeyDown = (event) => {
    if (!interactive) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = PROFICIENCY_LEVELS[Math.min(lastIndex, currentIndex + 1)]
      onChange(next.id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      const prev = PROFICIENCY_LEVELS[Math.max(0, currentIndex - 1)]
      onChange(prev.id)
    }
  }

  return (
    <div className={`otamatone-fader otamatone-fader-${size} ${interactive ? 'is-interactive' : ''}`}>
      <div
        className="otamatone-fader-track"
        ref={trackRef}
        role={interactive ? 'slider' : 'img'}
        aria-label={interactive ? '숙련도 선택' : `숙련도: ${PROFICIENCY_LEVELS[currentIndex].label}`}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? lastIndex : undefined}
        aria-valuenow={interactive ? currentIndex : undefined}
        aria-valuetext={interactive ? PROFICIENCY_LEVELS[currentIndex].label : undefined}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onClick={(event) => interactive && moveToClientX(event.clientX)}
      >
        {PROFICIENCY_LEVELS.map((level, idx) => (
          <span
            key={level.id}
            className="otamatone-fader-notch"
            style={{ left: `${(idx / lastIndex) * 100}%` }}
          />
        ))}
        <div className="otamatone-fader-knob" style={{ left: `${percent}%` }}>
          <span className="otamatone-fader-eye" />
          <span className="otamatone-fader-eye" />
          <span className="otamatone-fader-mouth" />
        </div>
      </div>
      <div className="otamatone-fader-labels">
        {PROFICIENCY_LEVELS.map((level, idx) => (
          <button
            key={level.id}
            type="button"
            className={idx === currentIndex ? 'is-active' : ''}
            disabled={!interactive}
            onClick={() => interactive && onChange(level.id)}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default OtamatoneFader
