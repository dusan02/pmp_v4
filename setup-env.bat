@echo off
echo Creating .env.local file...
echo.
echo # Polygon.io API Key - Get your free key at https://polygon.io/ > .env.local
echo # 1. Go to https://polygon.io/ >> .env.local
echo # 2. Sign up for a free account >> .env.local
echo # 3. Get your API key from the dashboard >> .env.local
echo # 4. Replace 'your_actual_api_key_here' with your real API key >> .env.local
echo POLYGON_API_KEY=your_actual_api_key_here >> .env.local
echo. >> .env.local
echo # Redis Configuration (optional - app works without Redis) >> .env.local
echo REDIS_URL=redis://localhost:6379 >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL=file:./data/premarket.db >> .env.local
echo. >> .env.local
echo # Next.js Configuration >> .env.local
echo NEXTAUTH_SECRET=your-secret-key-here >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo.
echo .env.local file created successfully!
echo.
echo Next steps:
echo 1. Edit .env.local and replace 'your_actual_api_key_here' with your real Polygon.io API key
echo 2. Restart the application with: npm run dev
echo.
pause 