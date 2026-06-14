$date = Get-Date -Format 'yyyy-MM-dd'
$branch = 'homelab-content'

git checkout -b $branch dev

git add -f src/content/avatar.jpg src/pages/about.md AGENTS.md dev.ps1
git add -f src/content/posts/*.md
git add -f src/content/posts/pics/*
git add -f docs/*.md
git add -f docs/superpowers/specs/*.md
git add -f src/content/memos/*.md

git commit -m "forge: full content $date"
git push homelab "${branch}:dev" --force
git checkout dev
git branch -D $branch

Write-Host "`nForge complete. Homelab dev has full content."
