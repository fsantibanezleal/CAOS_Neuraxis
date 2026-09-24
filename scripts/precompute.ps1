param([string]$Model = 'qwen3.5:4b')
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
& .venv/Scripts/python.exe data-pipeline/run.py all --model $Model
if ($LASTEXITCODE) { throw 'Scientific pipeline failed; canonical artifacts were not released' }
& .venv/Scripts/python.exe scripts/check_artifacts.py
if ($LASTEXITCODE) { throw 'Canonical artifact verification failed' }
