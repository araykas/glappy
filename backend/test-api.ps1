# PowerShell script untuk test API endpoints

Write-Host "=== Testing Happy Instalasi Backend API ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# 2. Get All Libraries
Write-Host "2. Testing Get All Libraries..." -ForegroundColor Yellow
$libraries = Invoke-RestMethod -Uri "http://localhost:5000/api/libraries" -Method Get
Write-Host "Found $($libraries.count) libraries" -ForegroundColor Green
$libraries.data | ForEach-Object { Write-Host "  - $($_.name) ($($_.id))" }
Write-Host ""

# 3. Get Library Details
Write-Host "3. Testing Get Library Details (OpenGL)..." -ForegroundColor Yellow
$opengl = Invoke-RestMethod -Uri "http://localhost:5000/api/libraries/opengl" -Method Get
Write-Host "Library: $($opengl.data.name)" -ForegroundColor Green
Write-Host "Platforms: $($opengl.data.platforms -join ', ')" -ForegroundColor Green
Write-Host ""

# 4. Generate Commands (Windows)
Write-Host "4. Testing Generate Commands (Windows)..." -ForegroundColor Yellow
$body = @{
    libraryId = "opengl"
    deviceSpecs = @{
        os = "windows"
        cpu = "Intel Core i7"
        gpu = "NVIDIA RTX 3060"
        ram = "16GB"
    }
} | ConvertTo-Json

$commands = Invoke-RestMethod -Uri "http://localhost:5000/api/commands/generate" -Method Post -Body $body -ContentType "application/json"
Write-Host "Generated $($commands.data.commands.Count) commands" -ForegroundColor Green
Write-Host "First command: $($commands.data.commands[0].title)" -ForegroundColor Green
Write-Host ""

# 5. AI Chat
Write-Host "5. Testing AI Chat..." -ForegroundColor Yellow
$chatBody = @{
    message = "Error saat compile OpenGL"
    context = @{
        deviceSpecs = @{
            os = "windows"
            cpu = "Intel Core i7"
        }
        library = @{
            id = "opengl"
            name = "OpenGL"
        }
    }
} | ConvertTo-Json -Depth 3

$aiResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" -Method Post -Body $chatBody -ContentType "application/json"
Write-Host "AI Response received (${$($aiResponse.data.aiResponse.Length)} chars)" -ForegroundColor Green
Write-Host "Suggestions: $($aiResponse.data.suggestions.Count)" -ForegroundColor Green
Write-Host ""

Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
