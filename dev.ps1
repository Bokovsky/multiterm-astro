node scripts/qa.mjs
if ($LASTEXITCODE -ne 0) {
  Write-Error "QA failed — aborting deployment"
  exit 1
}

npx vercel deploy --prebuilt --prod --yes
