# My AI Hub

A personal AI chat interface supporting Claude and GPT-4o, with folders, drag-and-drop organisation, a planner, and trash recovery.

## Stack

- **Frontend** — React 19 + TypeScript + Mantine v9 + Vite
- **Backend** — Ruby on Rails 7.2 (API mode)
- **Database** — PostgreSQL 16

## Features

- Chat with Claude or GPT-4o — model switcher per thread
- Folders — create folders, drag threads into them or into trash
- Desktop view — card grid of all chats with AI-generated summaries
- Planner — calendar + daily tasks, auto-redirect banner when chat mentions tasks
- Trash — soft delete with 30-day restore window, hard delete forever

## Requirements

- macOS with Homebrew
- Node.js 20+
- PostgreSQL 16 (running locally)
- Ruby 3.2.2 (installed automatically by setup script)

## First-time setup

```bash
git clone https://github.com/lily-sxy/my-ai-hub.git
cd my-ai-hub
./setup.sh
```

This will:
- Install rbenv + Ruby 3.2.2 if not present
- Install Rails and all gems
- Copy `.env.personal` → `.env` (fill in your credentials after)
- Run database migrations
- Install frontend npm packages

Then fill in your credentials:
```bash
# backend-ruby/.env
DB_PASSWORD=your_postgres_password
ANTHROPIC_API_KEY=your_key        # optional — mock responses work without it
OPENAI_API_KEY=your_key           # optional
```

## Running the app

```bash
./start.sh    # starts both backend (port 8000) and frontend (port 5173)
./stop.sh     # stops both servers from any terminal
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Logs: `logs/backend.log` and `logs/frontend.log`

`Ctrl+C` stops both servers. If either server crashes, `start.sh` restarts it automatically.

## Project structure

```
my-ai-hub/
├── start.sh                  # run the app
├── stop.sh                   # stop the app
├── setup.sh                  # first-time setup
├── frontend/
│   └── src/
│       ├── pages/            # Desktop, Chat, Planner, Trash
│       ├── components/       # AppShell, Sidebar
│       └── api/client.ts     # all API calls
└── backend-ruby/
    ├── app/
    │   ├── controllers/      # folders, threads, messages, tasks
    │   └── models/           # Folder, Thread, Message, Task
    ├── config/routes.rb      # all API routes
    ├── db/migrate/           # database migrations
    └── docs/api_collection.json  # import into Postman to test APIs
```

## API

Import `backend-ruby/docs/api_collection.json` into Postman to browse and test all endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/folders/` | List folders |
| POST | `/folders/` | Create folder |
| GET | `/threads/` | List active threads |
| POST | `/threads/` | Create thread |
| PATCH | `/threads/:id` | Rename / move to folder |
| DELETE | `/threads/:id` | Soft delete → Trash |
| DELETE | `/threads/:id/permanent` | Hard delete forever |
| POST | `/threads/:id/restore` | Restore from Trash |
| GET | `/threads/:id/messages/` | List messages |
| POST | `/threads/:id/messages/` | Send message (streaming) |
| GET | `/tasks/` | List tasks |
| POST | `/tasks/` | Create task |
| PATCH | `/tasks/:id` | Update task (mark done) |
| DELETE | `/tasks/:id` | Delete task |
