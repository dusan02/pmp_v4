'use client';

import { FC, memo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketIndicator {
  readonly name: string;
  readonly symbol: string;
  readonly value: number;
  readonly change: number;
  readonly changePercent: number;
}

const INITIAL_INDICATORS: ReadonlyArray<MarketIndicator> = [
  { name: 'S&P 500', symbol: 'SPX', value: 0, change: 0, changePercent: 0 },
  { name: 'NASDAQ', symbol: 'IXIC', value: 0, change: 0, changePercent: 0 },
];

const MarketIndicators: FC = () => {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([...INITIAL_INDICATORS]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIndicators = async () => {
    // TODO: Vymeňte mock za skutočný endpoint
    const data: MarketIndicator[] = [
      { name: 'S&P 500', symbol: 'SPX', value: 5234.18, change: 12.45, changePercent: 0.24 },
      { name: 'NASDAQ', symbol: 'IXIC', value: 16437.88, change: -23.67, changePercent: -0.14 },
    ];
    setIndicators(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIndicators();
    const id = setInterval(fetchIndicators, 30_000); // 30 s refresh
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <section className="market-indicators" aria-busy="true" aria-label="Major market indices">
        <div className="indicator-skeleton">
          <span className="sr-only">Načítavam trhové dáta…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="market-indicators" aria-label="Major market indices">
      {indicators.map(({ symbol, name, value, change, changePercent }) => (
        <article key={symbol} className="market-indicator" aria-labelledby={`${symbol}-name`}>
          <header className="indicator-header">
            <h3 id={`${symbol}-name`} className="indicator-name">
              {name}
            </h3>
            <span className="indicator-symbol" aria-hidden="true">
              {symbol}
            </span>
          </header>

          <dl className="indicator-values" aria-live="polite">
            <div>
              <dt className="sr-only">Current value</dt>
              <dd className="indicator-price">
                {value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>

            <div className={`indicator-change ${changePercent >= 0 ? 'positive' : 'negative'}`}>
              <dt className="sr-only">Change</dt>
              <dd>
                {changePercent >= 0 ? (
                  <TrendingUp size={16} aria-hidden="true" />
                ) : (
                  <TrendingDown size={16} aria-hidden="true" />
                )}
                <span className="change-value">
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(2)}
                </span>
                <span className="change-percent">
                  ({changePercent >= 0 ? '+' : ''}
                  {changePercent.toFixed(2)}%)
                </span>
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
};

export default memo(MarketIndicators); 