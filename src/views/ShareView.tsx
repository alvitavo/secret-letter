import { useState } from 'react'
import StereogramCanvas from '../components/StereogramCanvas'
import HowToView from '../components/HowToView'
import { makeShareUrl } from '../utils/encode'

interface Props {
  text: string
  canvas: HTMLCanvasElement
  onBack: () => void
}

export default function ShareView({ text, canvas, onBack }: Props) {
  const shareUrl = makeShareUrl(text)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 시 fallback
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `secret-letter-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="view share-view">
      <h2 className="section-title">🎉 스테레오그램이 완성됐어요!</h2>

      <div className="canvas-wrapper">
        <StereogramCanvas sourceCanvas={canvas} className="stereogram-canvas" />
      </div>

      <HowToView />

      <div className="share-section">
        <p className="share-label">퀴즈 공유 링크</p>
        <div className="share-url-row">
          <input
            readOnly
            className="url-input"
            value={shareUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? '✅ 복사됨' : '📋 복사'}
          </button>
        </div>
        <p className="share-hint">
          링크를 받은 사람은 스테레오그램을 보고 숨겨진 텍스트를 맞혀야 해요.
        </p>
      </div>

      <div className="action-row">
        <button className="btn btn-secondary" onClick={handleDownload}>
          ⬇ 이미지 저장
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          ← 새로 만들기
        </button>
      </div>
    </div>
  )
}
