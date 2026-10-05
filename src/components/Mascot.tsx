/** The whispering "shh" mascot. Fixed colours so it reads the same in light and dark. */
export function Mascot() {
  return (
    <svg className="mascot" width="76" height="76" viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 6c3 0 6 3 5 8" fill="none" stroke="#9C88F0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="8" r="4" fill="#C9BDFF" />
      <circle cx="38" cy="44" r="31" fill="#9FE3C4" />
      <path d="M22 40q5-6 10 0" fill="none" stroke="#2A2140" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 40q5-6 10 0" fill="none" stroke="#2A2140" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="20" cy="50" rx="5" ry="3" fill="#FFB79C" />
      <ellipse cx="56" cy="50" rx="5" ry="3" fill="#FFB79C" />
      <path d="M31 57q7 4 14 0" fill="none" stroke="#2A2140" strokeWidth="3" strokeLinecap="round" />
      <rect x="34" y="44" width="8" height="24" rx="4" fill="#FFC9A8" stroke="#2A2140" strokeWidth="2.5" />
      <path d="M66 22l7-4M68 31h8M66 40l7 4" fill="none" stroke="#9C88F0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
