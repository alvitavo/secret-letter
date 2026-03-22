import { useState, useRef } from 'react'
import { textToDepthMap, generateStereogram } from '../utils/stereogram'

const MAX_CHARS = 20

interface Props {
  onGenerate: (text: string, canvas: HTMLCanvasElement) => void
}

export default function CreateView({ onGenerate }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setError('텍스트를 입력해주세요.')
      inputRef.current?.focus()
      return
    }
    setError('')
    setLoading(true)

    // 스테레오그램 생성은 동기 연산이지만 UI 업데이트를 위해 defer
    requestAnimationFrame(() => {
      try {
        const W = 800
        const H = 420
        const depthMap = textToDepthMap(trimmed, W, H)
        const canvas = generateStereogram(depthMap, W, H)
        onGenerate(trimmed, canvas)
      } catch (err) {
        console.error(err)
        setError('생성 중 오류가 발생했습니다. 다시 시도해주세요.')
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="view create-view">
      <div className="create-hero">
        <h1>비밀 편지를 숨겨보세요</h1>
        <p>
          텍스트를 <strong>스테레오그램(매직아이)</strong> 이미지로 변환해
          퀴즈로 공유할 수 있어요.
        </p>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="secret-input">숨길 텍스트</label>
          <input
            id="secret-input"
            ref={inputRef}
            type="text"
            className="text-input"
            placeholder="예: 사랑해, Hello, ..."
            value={text}
            maxLength={MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <span className={`char-count ${text.length >= MAX_CHARS ? 'warn' : ''}`}>
            {text.length} / {MAX_CHARS}
          </span>
          {error && <span className="field-error">{error}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              생성 중…
            </>
          ) : (
            '✨ 스테레오그램 생성'
          )}
        </button>
      </form>

      <div className="tip-card">
        <span className="tip-icon">💡</span>
        <span>짧은 단어일수록 매직아이로 인식하기 쉬워요. 2~6자를 권장합니다.</span>
      </div>
    </div>
  )
}
