Write-Host "Uploading PreMarketPrice to GitHub..." -ForegroundColor Green

# Check if we have commits
Write-Host "Checking git status..." -ForegroundColor Yellow
git log --oneline -1

# Create new branch if needed
Write-Host "Creating main branch..." -ForegroundColor Yellow
git checkout -b main

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Fix blurry logos with robust fallback system"

# Instructions for GitHub
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub.com and create a new repository named 'PreMarketPrice'" -ForegroundColor White
Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/PreMarketPrice.git" -ForegroundColor White
Write-Host "3. Run: git push -u origin main" -ForegroundColor White

Read-Host "Press Enter to continue..." 