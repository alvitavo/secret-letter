/** 매직아이 보는 법 안내 컴포넌트 */
export default function HowToView() {
  return (
    <details className="how-to">
      <summary>👁 매직아이 보는 법</summary>
      <ol>
        <li>화면에서 <strong>30~40cm</strong> 정도 거리를 유지하세요.</li>
        <li>이미지 중앙을 바라보되, <strong>초점을 흐릿하게</strong> 만드세요 — 이미지 뒤쪽 먼 곳을 바라본다는 느낌으로요.</li>
        <li>서서히 패턴이 앞으로 떠오르면서 <strong>숨겨진 텍스트</strong>가 보입니다.</li>
        <li>잘 안 보이면 코끝에 화면을 가까이 댔다가 천천히 멀리 하며 초점을 잡아보세요.</li>
      </ol>
    </details>
  )
}
