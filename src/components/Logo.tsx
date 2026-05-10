export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Mark: a compass-style diamond split into quadrants */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="0" y="0" width="13" height="13" rx="3" fill="#5DCAA5" />
        <rect x="15" y="0" width="13" height="13" rx="3" fill="#EF9F27" />
        <rect x="0" y="15" width="13" height="13" rx="3" fill="#9FE1CB" />
        <rect x="15" y="15" width="13" height="13" rx="3" fill="#5DCAA5" />
      </svg>

      {/* Wordmark */}
      <span className="text-[22px] font-black tracking-tight leading-none select-none">
        <span className="text-[#E1F5EE]">Trvl</span>
        <span className="text-[#EF9F27]">Play</span>
      </span>
    </div>
  )
}
