@echo off
echo Uploading PreMarketPrice to GitHub...

REM Check if we have commits
git log --oneline -1

REM Create new branch if needed
git checkout -b main

REM Add all files
git add .

REM Commit changes
git commit -m "Fix blurry logos with robust fallback system"

REM Create new repository on GitHub (you need to do this manually)
echo Please create a new repository on GitHub named "PreMarketPrice"
echo Then run: git remote add origin https://github.com/YOUR_USERNAME/PreMarketPrice.git
echo Then run: git push -u origin main

pause 