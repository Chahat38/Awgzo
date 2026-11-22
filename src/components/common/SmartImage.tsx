import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface SmartImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function SmartImage({
  src,
  fallbackSrc,
  alt,
  title,
  width,
  height,
  className = '',
  loading = 'lazy',
}: SmartImageProps) {
  const [activeSrc, setActiveSrc] = useState(src);
  const [usedFallback, setUsedFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setActiveSrc(src);
    setUsedFallback(false);
    setFailed(false);
  }, [src, fallbackSrc]);

  if (failed || !activeSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-black via-black to-black p-6 text-center ${className}`}
      >
        <Layers className="mb-3 h-7 w-7 text-orange/80" />
        <span className="font-display text-sm font-semibold tracking-tight text-white/90">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!usedFallback && fallbackSrc && fallbackSrc !== activeSrc) {
          setUsedFallback(true);
          setActiveSrc(fallbackSrc);
        } else {
          setFailed(true);
        }
      }}
      className={className}
    />
  );
}
