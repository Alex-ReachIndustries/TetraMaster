import { useCallback, useEffect, useRef, useState } from 'react'
import type { Cutscene } from '../../data/cutscenes'

export const CutscenePlayer = ({
  cutscene,
  onComplete,
}: {
  cutscene: Cutscene
  onComplete: () => void
}) => {
  const [slideIndex, setSlideIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [typing, setTyping] = useState(true)
  const timerRef = useRef<number | null>(null)

  const slide = cutscene.slides[slideIndex]
  const fullText = slide ? (slide.speaker ? `${slide.speaker}: ${slide.text}` : slide.text) : ''

  useEffect(() => {
    setCharIndex(0)
    setTyping(true)
  }, [slideIndex])

  useEffect(() => {
    if (!typing || charIndex >= fullText.length) {
      setTyping(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCharIndex((prev) => prev + 1)
    }, 28)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [typing, charIndex, fullText])

  const advance = useCallback(() => {
    if (typing) {
      setCharIndex(fullText.length)
      setTyping(false)
      return
    }
    if (slideIndex < cutscene.slides.length - 1) {
      setSlideIndex((prev) => prev + 1)
    } else {
      onComplete()
    }
  }, [typing, slideIndex, cutscene.slides.length, onComplete, fullText.length])

  if (!slide) return null

  const displayText = fullText.slice(0, charIndex)
  const isLast = slideIndex === cutscene.slides.length - 1

  return (
    <div className="cutscene" onClick={advance} style={{
      background: `linear-gradient(180deg, ${slide.bg[0]} 0%, ${slide.bg[1]} 100%)`,
    }}>
      <div className="cutscene__vignette" />

      {slide.icon && (
        <div className="cutscene__icon">{slide.icon}</div>
      )}

      <div className="cutscene__text-box">
        {slide.speaker && (
          <div className="cutscene__speaker">{slide.speaker}</div>
        )}
        <div className="cutscene__text">
          {displayText}
          {typing && <span className="cutscene__cursor">▌</span>}
        </div>
      </div>

      <div className="cutscene__prompt">
        {typing ? 'Tap to skip' : isLast ? 'Tap to continue' : 'Tap for next'}
      </div>

      <div className="cutscene__progress">
        {cutscene.slides.map((_, i) => (
          <div key={i} className={`cutscene__dot ${i === slideIndex ? 'cutscene__dot--active' : i < slideIndex ? 'cutscene__dot--done' : ''}`} />
        ))}
      </div>

      <button className="cutscene__skip" onClick={(e) => { e.stopPropagation(); onComplete() }}>
        Skip
      </button>
    </div>
  )
}
