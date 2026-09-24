$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '../frontend')
npm run dev -- --host 127.0.0.1
if ($LASTEXITCODE) { throw 'Development server failed' }
