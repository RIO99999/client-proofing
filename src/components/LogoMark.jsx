// The Client Proofing mark: a proof sheet with an amber approval seal.
// Used in the header, auth aside and favicon (favicon.svg is the same geometry).
export default function LogoMark({ size = 28, className = '' }) {
  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="var(--forest)" />
      <rect x="14" y="13" width="30" height="36" rx="5" fill="var(--forest-2)" />
      <rect x="18" y="17" width="30" height="36" rx="5" fill="var(--paper)" />
      <rect x="23" y="26" width="18" height="3" rx="1.5" fill="var(--line-strong)" />
      <rect x="23" y="33" width="12" height="3" rx="1.5" fill="var(--line-strong)" />
      <circle cx="44" cy="44" r="11" fill="var(--amber)" stroke="var(--forest)" strokeWidth="3" />
      <path
        d="M39 44.2l3.4 3.3 6.2-6.4"
        fill="none"
        stroke="var(--forest)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
