import { useEffect, useReducer, useRef } from 'react'
import StereogramCanvas from '../components/StereogramCanvas'
import HowToView from '../components/HowToView'
import { decode } from '../utils/encode'
import { textToDepthMap, generateStereogram } from '../utils/stereogram'

interface Props {
  encoded: string
  onBack: () => void
}

type Phase = 'playing' | 'correct' | 'wrong' | 'revealed'

interface State {
  phase: Phase
  guess: string
  attempts: number
  canvas: HTMLCanvasElement | null
  secretText: string
  error: string
}

type Action =
  | { type: 'SET_CANVAS'; canvas: HTMLCanvasElement; secretText: string }
  | { type: 'SET_GUESS'; guess: string }
  | { type: 'SUBMIT' }
  | { type: 'REVEAL' }
  | { type: 'RETRY' }

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CANVAS':
      return { ...state, canvas: action.canvas, secretText: action.secretText }
    case 'SET_GUESS':
      return { ...state, guess: action.guess }
    case 'SUBMIT': {
      const correct =
        normalize(state.guess) === normalize(state.secretText)
      return {
        ...state,
        phase: correct ? 'correct' : 'wrong',
        attempts: state.attempts + 1,
      }
    }
    case 'REVEAL':
      return { ...state, phase: 'revealed' }
    case 'RETRY':
      return { ...state, phase: 'playing', guess: '' }
    default:
      return state
  }
}

const INIT: State = {
  phase: 'playing',
  guess: '',
  attempts: 0,
  canvas: null,
  secretText: '',
  error: '',
}

export default function QuizView({ encoded, onBack }: Props) {
  const [state, dispatch] = useReducer(reducer, INIT)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const secretText = decode(encoded)
      const depthMap = textToDepthMap(secretText, 800, 420)
      const canvas = generateStereogram(depthMap, 800, 420)
      dispatch({ type: 'SET_CANVAS', canvas, secretText })
    } catch {
      // encoded가 잘못된 경우 처리는 아래 조건부 렌더링에서 처리
    }
  }, [encoded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.guess.trim()) return
    dispatch({ type: 'SUBMIT' })
  }

  if (!state.canvas) {
    return (
      <div className="view quiz-view">
        <div className="loading-state">
          <span className="spinner large" aria-hidden="true" />
          <p>스테레오그램을 불러오는 중…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view quiz-view">
      <h2 className="section-title">🕵️ 비밀 메시지를 찾아라!</h2>
      <p className="quiz-subtitle">매직아이 속에 숨겨진 텍스트를 맞혀보세요.</p>

      <div className="canvas-wrapper">
        <StereogramCanvas sourceCanvas={state.canvas} className="stereogram-canvas" />
      </div>

      <HowToView />

      {/* 결과 배너 */}
      {state.phase === 'correct' && (
        <div className="result-banner correct">
          🎉 정답입니다! <strong>"{state.secretText}"</strong>
          {state.attempts > 1 && ` (${state.attempts}번 만에 성공!)`}
        </div>
      )}
      {state.phase === 'wrong' && (
        <div className="result-banner wrong">
          ❌ 틀렸어요. 다시 도전해보세요! (시도 {state.attempts}회)
        </div>
      )}
      {state.phase === 'revealed' && (
        <div className="result-banner revealed">
          정답은… <strong>"{state.secretText}"</strong> 이었어요!
        </div>
      )}

      {/* 입력 폼 */}
      {(state.phase === 'playing' || state.phase === 'wrong') && (
        <form className="quiz-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="text-input"
            placeholder="숨겨진 텍스트를 입력하세요"
            value={state.guess}
            onChange={(e) =>
              dispatch({ type: 'SET_GUESS', guess: e.target.value })
            }
            autoComplete="off"
            autoFocus={state.phase === 'wrong'}
          />
          <div className="quiz-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!state.guess.trim()}
            >
              확인
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => dispatch({ type: 'REVEAL' })}
            >
              포기 (정답 보기)
            </button>
          </div>
        </form>
      )}

      <div className="back-row">
        <button className="btn btn-ghost" onClick={onBack}>
          ← 나도 만들어보기
        </button>
      </div>
    </div>
  )
}
