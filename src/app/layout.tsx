import './globals.css';

export const metadata = {
  title: 'PreMarketPrice.com',
  description: 'Pre-market changes & market cap diff viewer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 