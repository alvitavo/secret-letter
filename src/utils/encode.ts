/**
 * 텍스트를 URL-safe Base64로 인코딩 (UTF-8 지원)
 */
export function encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binStr = ''
  bytes.forEach((b) => (binStr += String.fromCharCode(b)))
  return btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * URL-safe Base64를 텍스트로 디코딩
 */
export function decode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (padded.length % 4)) % 4
  const binStr = atob(padded + '='.repeat(padding))
  const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** 퀴즈 공유 URL 생성 */
export function makeShareUrl(text: string): string {
  const encoded = encode(text)
  return `${location.origin}${location.pathname}#quiz/${encoded}`
}
