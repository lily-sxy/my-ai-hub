# My AI Hub

A personal AI chat interface supporting Claude and GPT-4o, with folders, drag-and-drop, a planner, and trash recovery.

## Stack

- **Frontend** — React 19 + TypeScript + Mantine v9 + Vite
- **Backend** — Ruby on Rails 7.2 (API mode)
- **Database** — PostgreSQL

## Features

- Chat with Claude or GPT-4o (model switcher per thread)
- Folders — drag threads into folders or trash
- Desktop view — card grid of all chats with AI summaries
- Planner — calendar + daily tasks, auto-redirect from chat
- Trash — restore deleted chats within 30 days

## Setup

### Requirements
- Ruby 3.2.2 (`rbenv install 3.2.2`)
- Node.js 20+
- PostgreSQL 16

### Backend
```bash
cd backend-ruby
cp .env.personal .env     # fill in your credentials
bundle install
rails db:create db:migrate
rails server -p 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
