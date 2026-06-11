#!/bin/bash
set -e

echo "Setting up My AI Hub..."

# ── rbenv + Ruby ──────────────────────────────────────────
if ! command -v rbenv &>/dev/null; then
  echo "Installing rbenv..."
  brew install rbenv ruby-build
fi

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

if ! rbenv versions | grep -q "3.2.2"; then
  echo "Installing Ruby 3.2.2 (this takes ~5 min)..."
  rbenv install 3.2.2
fi

rbenv global 3.2.2
echo "  Ruby $(ruby --version)"

# ── rbenv in shell ────────────────────────────────────────
if ! grep -q 'rbenv init' ~/.zshrc; then
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
  echo 'eval "$(rbenv init -)"' >> ~/.zshrc
  echo "  Added rbenv to ~/.zshrc"
fi

# ── Rails + gems ──────────────────────────────────────────
if ! gem list rails | grep -q "rails"; then
  echo "Installing Rails..."
  gem install rails --no-document
fi

echo "Installing Ruby gems..."
cd "$(dirname "$0")/backend-ruby"
bundle install

# ── .env ──────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.personal .env
  echo "  Created backend-ruby/.env — fill in your credentials"
fi

# ── Database ──────────────────────────────────────────────
echo "Running database migrations..."
bundle exec rails db:migrate

# ── Node + frontend ───────────────────────────────────────
echo "Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
npm install

# ── Logs folder ───────────────────────────────────────────
mkdir -p "$(dirname "$0")/logs"

echo ""
echo "Setup complete!"
echo "Run ./start.sh to launch the app"
