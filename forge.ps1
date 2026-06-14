$date = Get-Date -Format 'yyyy-MM-dd'
$branch = 'homelab-content'

git checkout -b $branch dev
git add -f src/content/posts/ src/content/memos/ src/content/avatar.jpg src/pages/about.md docs/ AGENTS.md dev.ps1 forge.ps1
git commit -m "forge: full content $date"
git push homelab $branch:dev --force
git checkout dev
git branch -D $branch
