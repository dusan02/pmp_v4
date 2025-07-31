Write-Host "=== Bezpečný Upload na GitHub ===" -ForegroundColor Green
Write-Host ""

# Kontrola git stavu
Write-Host "Kontrolujem git stav..." -ForegroundColor Yellow
try {
    $status = git status --porcelain
    if ($status) {
        Write-Host "Nájdené zmeny:" -ForegroundColor Cyan
        $status | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    }
    else {
        Write-Host "Žiadne zmeny na commitnutie." -ForegroundColor Green
        exit 0
    }
}
catch {
    Write-Host "Chyba pri kontrole git stavu: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Pridanie súborov
Write-Host "Pridávam súbory..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "Súbory úspešne pridané." -ForegroundColor Green
}
catch {
    Write-Host "Chyba pri pridávaní súborov: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Commit zmien
Write-Host "Vytváram commit..." -ForegroundColor Yellow
$commitMessage = "Update PreMarketPrice application - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
try {
    git commit -m $commitMessage
    Write-Host "Commit úspešne vytvorený: $commitMessage" -ForegroundColor Green
}
catch {
    Write-Host "Chyba pri vytváraní commitu: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Kontrola remote repository
Write-Host "Kontrolujem remote repository..." -ForegroundColor Yellow
try {
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "Remote repository: $remote" -ForegroundColor Cyan
        
        # Push zmien
        Write-Host "Posielam zmeny na GitHub..." -ForegroundColor Yellow
        git push origin main
        Write-Host "Zmeny úspešne odoslané na GitHub!" -ForegroundColor Green
    }
    else {
        Write-Host "Remote repository nie je nastavené." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "=== NÁVOD NA NASTAVENIE ===" -ForegroundColor Cyan
        Write-Host "1. Choďte na GitHub.com a vytvorte nový repository 'PreMarketPrice'" -ForegroundColor White
        Write-Host "2. Spustite tento príkaz:" -ForegroundColor White
        Write-Host "   git remote add origin https://github.com/VASE_USERNAME/PreMarketPrice.git" -ForegroundColor Yellow
        Write-Host "3. Potom spustite:" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Chyba pri kontrole remote repository: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Upload dokončený!" -ForegroundColor Green
Read-Host "Stlačte Enter pre pokračovanie..." 