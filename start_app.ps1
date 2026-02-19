# MediVault Startup Script for Windows
Write-Host "🚀 Starting MediVault Healthcare Platform..." -ForegroundColor Cyan

# Start Backend in a new window
Write-Host "📦 Starting Spring Boot Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd medivault-backend; mvn spring-boot:run"

# Start Frontend in a new window
Write-Host "🌐 Starting React Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command cd medi-vault; npm run dev"

Write-Host "✅ Both services are starting in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"
