import { useId } from 'react';
export default function KunaiTargetArt({ hits = [] }) {
  const woodId = useId();
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <pattern id={woodId} width="200" height="17" patternUnits="userSpaceOnUse">
          <rect width="200" height="17" fill="#8d613f" />
          <path
            d="M0 2Q50 9 100 3T200 4M0 13q70-7 130 0t70-1"
            stroke="#3f2b21"
            strokeOpacity=".38"
            fill="none"
          />
        </pattern>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#3b2b23" stroke="#c09966" strokeWidth="3" />
      <circle cx="100" cy="100" r="88" fill={`url(#${woodId})`} />
      <circle cx="100" cy="100" r="68" fill="#e4cfa5" stroke="#543b29" strokeWidth="2" />
      <circle cx="100" cy="100" r="47" fill="#9f3c30" />
      <circle cx="100" cy="100" r="28" fill="#e4cfa5" />
      <circle cx="100" cy="100" r="11" fill="#9f3c30" />
      <path d="M100 23v11m0 132v11M23 100h11m132 0h11" stroke="#d4b47f" strokeWidth="2" />
      {hits.map((hit) => (
        <g key={hit.id} transform={`translate(${hit.x} ${hit.y}) rotate(${hit.angle})`}>
          <g className="kunai-wood-chips" fill="#c79b63">
            <path d="m-5 0-12-7 5 10Zm9-1 14-6-7 10ZM0 4l-4 12 8-8Z" />
          </g>
          <g className="kunai-impact">
            <ellipse
              className="kunai-contact-shadow"
              cx="3"
              cy="-3"
              rx="8"
              ry="3"
              fill="#1b1918"
              opacity=".4"
            />
            <path d="M0 0-9-29 0-42 9-29Z" fill="#354049" stroke="#121a20" strokeWidth="1.2" />
            <path d="M0 0v-42l9 13Z" fill="#859197" />
            <path d="M-4-43h8v-22h-8Z" fill="#282c30" stroke="#111a20" />
            <path d="m-4-61 8 4m-8 2 8 4m-8 2 8 4" stroke="#9b8a71" strokeWidth="2" />
            <path d="M-9-42H9" stroke="#151c20" strokeWidth="3" />
            <circle cx="0" cy="-72" r="6" stroke="#222c33" strokeWidth="3" fill="none" />
          </g>
        </g>
      ))}
    </svg>
  );
}
