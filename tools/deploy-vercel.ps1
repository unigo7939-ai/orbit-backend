# ORBIT Alpha — Vercel deploy helper
# Usage: .\tools\deploy-vercel.ps1 [-SiweDomain "your-app.vercel.app"]
param(
  [string]$SiweDomain = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Require-VercelLogin {
  $who = npx vercel whoami 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "请先登录 Vercel: npx vercel login" -ForegroundColor Yellow
    exit 1
  }
  Write-Host "Vercel: $who"
}

function Read-EnvFile {
  param([string]$Path)
  $vars = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    if ($val) { $vars[$key] = $val }
  }
  return $vars
}

function Add-VercelEnv {
  param([string]$Name, [string]$Value, [string[]]$Targets = @("production", "preview", "development"))
  foreach ($t in $Targets) {
    $Value | npx vercel env add $Name $t --force 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Failed to set $Name ($t)" -ForegroundColor Red
      exit 1
    }
  }
  Write-Host "  + $Name"
}

Require-VercelLogin

if (-not (Test-Path ".env.local")) {
  Write-Host "缺少 .env.local" -ForegroundColor Red
  exit 1
}

$envVars = Read-EnvFile ".env.local"

$required = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SESSION_SECRET",
  "ADMIN_WALLET_ADDRESS",
  "PAYMENT_WALLET_ADDRESS",
  "USDC_CONTRACT_BASE",
  "BASE_RPC_URL"
)

foreach ($k in $required) {
  if (-not $envVars.ContainsKey($k) -or -not $envVars[$k]) {
    Write-Host "缺少环境变量: $k" -ForegroundColor Red
    exit 1
  }
}

Write-Host "`n链接 Vercel 项目..." -ForegroundColor Cyan
npx vercel link --yes 2>&1
if ($LASTEXITCODE -ne 0) { exit 1 }

if (-not $SiweDomain) {
  Write-Host "`n首次部署（获取生产域名）..." -ForegroundColor Cyan
  $deployOut = npx vercel --yes 2>&1 | Out-String
  Write-Host $deployOut
  if ($deployOut -match "https://([a-zA-Z0-9\-]+\.vercel\.app)") {
    $SiweDomain = $Matches[1]
    Write-Host "`n检测到域名: $SiweDomain" -ForegroundColor Green
  } else {
    $SiweDomain = Read-Host "请输入 Vercel 域名（不含 https://，如 orbit-backend.vercel.app）"
  }
}

$envVars["SIWE_DOMAIN"] = $SiweDomain

Write-Host "`n上传环境变量到 Vercel..." -ForegroundColor Cyan
foreach ($k in ($required + @("SIWE_DOMAIN"))) {
  Add-VercelEnv -Name $k -Value $envVars[$k]
}

Write-Host "`n生产部署..." -ForegroundColor Cyan
npx vercel --prod --yes 2>&1
if ($LASTEXITCODE -ne 0) { exit 1 }

$prodUrl = "https://$SiweDomain"
Write-Host "`n部署完成!" -ForegroundColor Green
Write-Host "  健康检查: $prodUrl/api/health"
Write-Host "  分类 API: $prodUrl/api/categories"
Write-Host "  管理后台: $prodUrl/admin"
Write-Host "  SIWE_DOMAIN: $SiweDomain"
