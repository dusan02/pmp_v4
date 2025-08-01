'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CompanyLogoProps {
  ticker: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function CompanyLogo({
  ticker,
  size = 32,
  className = '',
  priority = false
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  // Determine which size variant to use (32 or 64 for retina)
  const logoSize = size <= 32 ? 32 : 64;
  const logoSrc = `/logos/${ticker.toLowerCase()}-${logoSize}.webp`;
  
  // Fallback placeholder component
  const LogoPlaceholder = () => (
    <div 
      className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${className}`}
      style={{ 
        width: size, 
        height: size,
        fontSize: size * 0.3
      }}
    >
      {ticker.slice(0, 2)}
    </div>
  );

  // If logo failed to load, show placeholder
  if (hasError) {
    return <LogoPlaceholder />;
  }

  return (
    <Image
      src={logoSrc}
      alt={`${ticker} company logo`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ 
        objectFit: 'contain'
      }}
      priority={priority}
      onError={() => {
        console.log(`❌ Logo not found for ${ticker}, using placeholder`);
        setHasError(true);
      }}
    />
  );
} 