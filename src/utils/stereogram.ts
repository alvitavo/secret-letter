import type { StereogramOptions } from '../types'

const FONT_FACE =
  "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', Arial, sans-serif"

/**
 * 텍스트를 오프스크린 캔버스에 렌더링하고 깊이맵(Float32Array)을 반환합니다.
 * 배경 = 0(멀리), 텍스트 = ~0.7(가까이)
 */
export function textToDepthMap(
  text: string,
  width: number,
  height: number,
): Float32Array {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 배경: 검정 (깊이 0)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  // 텍스트 크기 자동 조정
  let fontSize = Math.floor(height * 0.55)
  ctx.font = `bold ${fontSize}px ${FONT_FACE}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxW = width * 0.88
  const tw = ctx.measureText(text).width
  if (tw > maxW) {
    fontSize = Math.floor(fontSize * (maxW / tw))
    ctx.font = `bold ${fontSize}px ${FONT_FACE}`
  }

  // 텍스트: 밝은 회색 (깊이 ~0.7, 너무 극단적이지 않게)
  ctx.fillStyle = '#b2b2b2'
  ctx.fillText(text, width / 2, height / 2)

  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData
  const depthMap = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    depthMap[i] = data[i * 4] / 255
  }
  return depthMap
}

/**
 * Union-Find: 루트 탐색 (경로 압축 포함)
 * same[x] <= x 불변식 유지 → 왼쪽→오른쪽 색상 할당 가능
 */
function find(same: Int32Array, start: number): number {
  let x = start
  while (same[x] !== x) x = same[x]
  // 경로 압축
  let y = start
  while (same[y] !== x) {
    const next = same[y]
    same[y] = x
    y = next
  }
  return x
}

/**
 * SIRDS (Single Image Random Dot Stereogram) 생성
 *
 * 알고리즘 핵심:
 * 1. 각 픽셀의 깊이에 따라 좌우 눈이 같은 색으로 봐야 할 픽셀 쌍을 계산
 * 2. Union-Find로 같은 색을 가져야 할 픽셀 집합을 관리
 * 3. 루트 픽셀에 랜덤 색상을, 나머지는 루트 색상을 복사
 */
export function generateStereogram(
  depthMap: Float32Array,
  width: number,
  height: number,
  options: StereogramOptions = {},
): HTMLCanvasElement {
  const E = Math.round(width * (options.eyeSepRatio ?? 1 / 6))
  const mu = options.mu ?? 0.33

  // 깊이 z에 따른 좌우 픽셀 간격
  const sep = (z: number) =>
    Math.round(((1 - mu * z) * E) / (2 - mu * z))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.createImageData(width, height)
  const pix = imgData.data

  for (let y = 0; y < height; y++) {
    // 각 행마다 Union-Find 초기화
    const same = new Int32Array(width)
    for (let x = 0; x < width; x++) same[x] = x

    // 깊이에 따른 제약 조건 생성
    for (let x = 0; x < width; x++) {
      const z = depthMap[y * width + x]
      const s = sep(z)
      const left = x - (s >> 1)
      const right = left + s

      if (left >= 0 && right < width) {
        const l = find(same, left)
        const r = find(same, right)
        if (l !== r) {
          // 큰 루트가 작은 루트를 가리키도록 → same[x] <= x 보장
          if (l < r) same[r] = l
          else same[l] = r
        }
      }
    }

    // 왼쪽→오른쪽 색상 할당
    // same[x] < x 이므로 x 처리 시점에 same[x]는 이미 색상이 결정됨
    const rr = new Uint8Array(width)
    const gg = new Uint8Array(width)
    const bb = new Uint8Array(width)

    for (let x = 0; x < width; x++) {
      const s = same[x]
      if (s === x) {
        // 루트 픽셀: 랜덤 색상
        rr[x] = (Math.random() * 256) | 0
        gg[x] = (Math.random() * 256) | 0
        bb[x] = (Math.random() * 256) | 0
      } else {
        // 제약 픽셀: same[x]의 색상 복사 (s < x, 이미 처리됨)
        rr[x] = rr[s]
        gg[x] = gg[s]
        bb[x] = bb[s]
      }
    }

    const base = y * width * 4
    for (let x = 0; x < width; x++) {
      const i = base + x * 4
      pix[i] = rr[x]
      pix[i + 1] = gg[x]
      pix[i + 2] = bb[x]
      pix[i + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas
}
