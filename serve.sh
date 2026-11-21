#!/bin/bash
# Chạy thử trang trên máy. Dùng: ./serve.sh
# Mở http://localhost:4010/ sau khi thấy "Server running..."
# Bấm r/R trong terminal để rebuild thủ công; Ctrl+C để dừng.

export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
export GEM_HOME="$HOME/.gem-beautiful-jekyll"
export PATH="$GEM_HOME/bin:$PATH"

cd "$(dirname "$0")"

if ! gem list -i bundler -v ">=0" --silent >/dev/null 2>&1; then
  gem install bundler --no-document
fi

bundle check >/dev/null 2>&1 || bundle install

bundle exec jekyll serve --config _config.yml,_config_dev.yml --future --livereload --port 4010 --livereload-port 35730 &
JEKYLL_PID=$!

cleanup() {
  kill "$JEKYLL_PID" 2>/dev/null
  wait "$JEKYLL_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "Bấm 'r' để rebuild thủ công, Ctrl+C để dừng server."

if [[ -t 0 ]]; then
  while IFS= read -rsn1 key; do
    if [[ "$key" == "r" || "$key" == "R" ]]; then
      echo "[serve.sh] Rebuilding..."
      bundle exec jekyll build --config _config.yml,_config_dev.yml --future
    fi
  done
else
  wait "$JEKYLL_PID"
fi

cleanup
