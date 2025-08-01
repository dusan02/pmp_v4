Write-Host "Checking Polygon.io API key..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Creating .env.local file with your API key..." -ForegroundColor Yellow
    
    $envContent = @"
# Polygon.io API Key - Get your free key at https://polygon.io/
POLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX

# Redis Configuration (optional - app works without Redis)
REDIS_URL=redis://localhost:6379

# Database Configuration
DATABASE_URL=file:./data/premarket.db

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local file created with your API key!" -ForegroundColor Green
}
else {
    # Check if API key is in the file
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "POLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX") {
        Write-Host "✅ API key found in .env.local" -ForegroundColor Green
    }
    else {
        Write-Host "❌ API key not found or incorrect in .env.local" -ForegroundColor Red
        Write-Host "Updating .env.local with your API key..." -ForegroundColor Yellow
        
        # Replace or add the API key
        if ($envContent -match "POLYGON_API_KEY=") {
            $envContent = $envContent -replace "POLYGON_API_KEY=.*", "POLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX"
        }
        else {
            $envContent = "# Polygon.io API Key - Get your free key at https://polygon.io/`nPOLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX`n`n" + $envContent
        }
        
        $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Host "✅ .env.local file updated with your API key!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. The API key should now be loaded correctly" -ForegroundColor White
Write-Host "3. You should see live data instead of demo data" -ForegroundColor White 