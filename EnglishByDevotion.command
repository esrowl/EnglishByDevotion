#!/bin/zsh
# Finder opens .command files in Terminal. Keep the normal browser origin stable.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd -- "${0:A:h}" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadı. Node.js LTS kurup yeniden deneyin."
  read -r "?Kapatmak için Enter..."
  exit 1
fi
node scripts/start.mjs "$@"
result=$?
if (( result != 0 )); then
  read -r "?Başlatma başarısız. Kapatmak için Enter..."
fi
exit $result
