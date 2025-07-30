'use client';

import { useState, useEffect } from 'react';
import { getDomain, companyColors } from '@/lib/getLogoUrl';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [src, setSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get all possible logo sources
  const getLogoSources = (ticker: string) => {
    // Use the centralized domain mapping from getLogoUrl.ts
    let domain: string;
    try {
      domain = getDomain(ticker);
    } catch (error) {
      // If no domain mapping exists, return only ui-avatars
      const color = companyColors[ticker] || '0066CC';
      return [
        `https://ui-avatars.com/api/?name=${ticker}&background=${color}&size=${size}&color=fff&font-size=0.4&bold=true&format=png`
      ];
    }
    
    return [
      // Primary: Clearbit (real company logos)
      `https://logo.clearbit.com/${domain}?size=${size}`,
      // Fallback: Google Favicon (works for most companies)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
      // Secondary: DuckDuckGo favicon
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // Last resort: ui-avatars with company colors
      `https://ui-avatars.com/api/?name=${ticker}&background=${companyColors[ticker] || '0066CC'}&size=${size}&color=fff&font-size=0.4&bold=true&format=png`
    ];
  };

  useEffect(() => {
    const logoSources = getLogoSources(ticker);
    setCurrentIndex(0);
    setSrc(logoSources[0]);
    setIsLoading(true);
  }, [ticker, size]);

  useEffect(() => {
    if (!src) return;

    const logoSources = getLogoSources(ticker);
    const img = new Image();
    img.src = src;

    const handleLoad = () => {
      setIsLoading(false);
      console.log(`✅ Logo loaded successfully for ${ticker}: ${src}`);
    };

    const handleError = () => {
      console.log(`❌ Logo failed for ${ticker}: ${src} (${currentIndex + 1}/${logoSources.length})`);
      
      if (currentIndex < logoSources.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSrc(logoSources[nextIndex]);
      } else {
        // All sources failed, stay on the last one (ui-avatars)
        setIsLoading(false);
        console.warn(`⚠️ All logo sources failed for ${ticker}. Using fallback avatar.`);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, currentIndex, ticker, size]);

  return (
    <img
      src={src}
      alt={`${ticker} company logo`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ 
        objectFit: 'contain',
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.2s ease-in-out'
      }}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
} 