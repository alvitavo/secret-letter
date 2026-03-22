export type Route =
  | { name: 'create' }
  | { name: 'share'; text: string; canvas: HTMLCanvasElement }
  | { name: 'quiz'; encoded: string }

export interface StereogramOptions {
  /** 눈 간격 비율 (이미지 너비 대비, 기본 1/6) */
  eyeSepRatio?: number
  /** 깊이 강도 (기본 0.33) */
  mu?: number
}
