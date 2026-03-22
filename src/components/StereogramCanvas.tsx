import { useEffect, useRef } from 'react'

interface Props {
  /** generateStereogram()이 반환한 오프스크린 HTMLCanvasElement */
  sourceCanvas: HTMLCanvasElement
  className?: string
}

/**
 * 스테레오그램 캔버스를 화면에 표시하는 컴포넌트.
 * sourceCanvas의 내용을 visible 캔버스에 복사합니다.
 */
export default function StereogramCanvas({ sourceCanvas, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const dst = ref.current
    if (!dst) return
    dst.width = sourceCanvas.width
    dst.height = sourceCanvas.height
    dst.getContext('2d')!.drawImage(sourceCanvas, 0, 0)
  }, [sourceCanvas])

  return <canvas ref={ref} className={className} />
}
