export function RegisterIllustration() {
  return (
    <svg
      viewBox="0 0 520 480"
      aria-hidden="true"
      className="w-full max-w-[500px]"
      fill="none"
    >
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity=".25" />
        </filter>
        <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ed5b83" />
          <stop offset="1" stopColor="#ad184a" />
        </linearGradient>
      </defs>

      <path
        d="M101 109c30-60 91-73 143-38l169 113c49 33 43 106-10 130L208 403c-72 33-150-23-141-102l20-174c1-7 6-13 14-18Z"
        fill="#ff7200"
      />
      <path
        d="M207 197 116 137M214 205l-91 159M228 209l143-9M223 219l88 126"
        stroke="#eceff1"
        strokeWidth="13"
        strokeLinecap="round"
      />

      <g filter="url(#shadow)">
        <circle cx="102" cy="104" r="52" fill="#fb3e72" />
        <circle cx="102" cy="88" r="16" fill="#f8fafc" />
        <path
          d="M78 132c2-24 11-35 24-35s22 11 24 35c-12 9-36 9-48 0Z"
          fill="#f8fafc"
        />
      </g>
      <circle cx="333" cy="111" r="33" stroke="#fb3e72" strokeWidth="12" />
      <circle cx="406" cy="207" r="22" stroke="#fb3e72" strokeWidth="11" />
      <circle cx="141" cy="353" r="34" stroke="#fb3e72" strokeWidth="11" />
      <circle cx="335" cy="344" r="40" fill="#fb3e72" />
      <circle cx="335" cy="344" r="18" fill="#ff91ae" />

      <g filter="url(#shadow)">
        <circle
          cx="221"
          cy="228"
          r="77"
          fill="#f8fafc"
          stroke="#777"
          strokeWidth="7"
        />
        <ellipse cx="221" cy="230" rx="53" ry="62" fill="#121212" />
        <ellipse cx="221" cy="223" rx="38" ry="49" fill="#ffc5a9" />
        <path
          d="M182 212c2-43 21-60 42-58 31 2 43 26 38 63-8-20-19-34-34-43-9 18-25 30-46 38Z"
          fill="#111"
        />
        <circle cx="207" cy="223" r="3.5" fill="#202020" />
        <circle cx="236" cy="223" r="3.5" fill="#202020" />
        <path
          d="M213 242c6 5 13 5 19 0"
          stroke="#a94a4a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M169 280c14-29 35-42 52-42 19 0 40 13 54 42-26 25-80 26-106 0Z"
          fill="url(#shirt)"
        />
      </g>

      <g fill="#ff7200" stroke="#e95500" strokeWidth="4">
        <path d="m86 278 12 22 22 12-22 12-12 23-12-23-22-12 22-12 12-22Z" />
        <path d="m386 82 10 19 19 10-19 10-10 20-10-20-19-10 19-10 10-19Z" />
      </g>
      <g fill="#fb3e72">
        <circle cx="458" cy="284" r="13" />
        <circle cx="435" cy="313" r="7" />
        <circle cx="409" cy="329" r="5" />
      </g>
      <g fill="#eef1f1" filter="url(#shadow)">
        <circle cx="72" cy="54" r="14" />
        <circle cx="98" cy="35" r="7" />
      </g>
    </svg>
  );
}
