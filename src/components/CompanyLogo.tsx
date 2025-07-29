'use client';

import React, { useMemo } from 'react';
import OptimizedImage from './OptimizedImage';
import { getLogoUrl } from '@/lib/getLogoUrl';

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
  const logoUrl = useMemo(() => {
    const baseUrl = getLogoUrl(ticker);
    
    // Add size parameter for better quality
    return `${baseUrl}?size=${size}`;
  }, [ticker, size]);

  const fallbackUrl = useMemo(() => {
    // Fallback to a generic company icon
    return `https://ui-avatars.com/api/?name=${ticker}&background=random&size=${size}&color=fff&font-size=0.4`;
  }, [ticker, size]);

  return (
    <OptimizedImage
      src={logoUrl}
      alt={`${ticker} company logo`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority={priority}
      fallback={fallbackUrl}
      onError={() => {
        console.warn(`Failed to load logo for ${ticker}`);
      }}
    />
  );
} 