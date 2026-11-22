import { useState } from 'react';
import { AWGZO_SITE } from '../../data/site';

interface AwgzoLogoProps {
  className?: string;
  compact?: boolean;
  hideWordmarkBelow480?: boolean;
}

export function AwgzoLogo({
  className = '',
  compact = false,
  hideWordmarkBelow480 = false,
}: AwgzoLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  // If the uploaded lockup image already contains the AWGZO name, do NOT render duplicate text beside it.
  const showSeparateWordmark = imgFailed || !AWGZO_SITE.logoIncludesWordmark;

  return (
    <span
      className={`inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap select-none ${className}`}
    >
      {!imgFailed ? (
        <img
          src={AWGZO_SITE.logoUrl}
          alt="AWGZO"
          width={120}
          height={36}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="object-contain w-auto"
          style={{
            height: 'clamp(28px, 3vw, 36px)',
            maxWidth: '140px',
          }}
        />
      ) : (
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
          style={{ height: 'clamp(28px, 3vw, 36px)', width: 'auto' }}
        >
          <path d="M16 2.5L29 26.5H21.8L16 15.2L10.2 26.5H3L16 2.5Z" fill="#f7f8f7" />
          <path d="M16 15.2L20.4 23.6H11.6L16 15.2Z" fill="#e86d22" />
        </svg>
      )}

      {showSeparateWordmark && (
        <span
          className={`grid overflow-hidden transition-[grid-template-columns,opacity] duration-300 ${
            compact
              ? 'grid-cols-[0fr] opacity-0'
              : hideWordmarkBelow480
                ? 'grid-cols-[0fr] opacity-0 min-[480px]:grid-cols-[1fr] min-[480px]:opacity-100'
                : 'grid-cols-[1fr] opacity-100'
          }`}
        >
          <span
            className="min-w-0 font-display font-bold text-white"
            style={{
              fontSize: 'clamp(14px, 1.2vw, 18px)',
              letterSpacing: '0.08em',
            }}
          >
            {AWGZO_SITE.brandName}
          </span>
        </span>
      )}
    </span>
  );
}
