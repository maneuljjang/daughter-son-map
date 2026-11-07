// 카테고리 아이콘 (굵은 선 일러스트)
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }

export default function CategoryIcon({ cat, size = 24 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      {cat === 'food' && (
        <g {...S}>
          <path d="M10 30 h44 a22 22 0 0 1 -44 0 z" fill="currentColor" fillOpacity="0.15" />
          <path d="M22 22 c0 -6 6 -6 6 -12 M34 22 c0 -6 6 -6 6 -12" />
          <path d="M18 56 h28" />
        </g>
      )}
      {cat === 'cafe' && (
        <g {...S}>
          <path d="M12 24 h32 v14 a14 14 0 0 1 -14 14 h-4 a14 14 0 0 1 -14 -14 z" fill="currentColor" fillOpacity="0.15" />
          <path d="M44 28 h4 a7 7 0 0 1 0 14 h-5" />
          <path d="M22 16 c0 -4 4 -4 4 -8 M32 16 c0 -4 4 -4 4 -8" />
        </g>
      )}
      {cat === 'fun' && (
        <g {...S}>
          <path d="M8 26 L32 10 L56 26 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M14 26 v22 M26 26 v22 M38 26 v22 M50 26 v22 M8 54 h48" />
        </g>
      )}
      {cat === 'walk' && (
        <g {...S}>
          <path d="M32 8 L50 38 H14 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M32 38 v16 M20 54 h24" />
          <path d="M32 22 l-6 8 M32 28 l6 6" />
        </g>
      )}
    </svg>
  )
}
