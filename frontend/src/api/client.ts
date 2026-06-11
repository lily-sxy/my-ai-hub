const BASE = 'http://localhost:8000'

export const api = {
  getFolders: () => fetch(`${BASE}/folders/`).then(r => r.json()),
  createFolder: (body: { name: string }) =>
    fetch(`${BASE}/folders/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  deleteFolder: (id: string) => fetch(`${BASE}/folders/${id}`, { method: 'DELETE' }).then(r => r.json()),

  getThreads: () => fetch(`${BASE}/threads/`).then(r => r.json()),
  getDeletedThreads: () => fetch(`${BASE}/threads/?include_deleted=true`).then(r => r.json()),
  createThread: (body: any) =>
    fetch(`${BASE}/threads/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  updateThread: (id: string, body: any) =>
    fetch(`${BASE}/threads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  deleteThread: (id: string) => fetch(`${BASE}/threads/${id}`, { method: 'DELETE' }).then(r => r.json()),
  restoreThread: (id: string) => fetch(`${BASE}/threads/${id}/restore`, { method: 'POST' }).then(r => r.json()),

  getMessages: (threadId: string) => fetch(`${BASE}/threads/${threadId}/messages/`).then(r => r.json()),
  sendMessage: (threadId: string, content: string) =>
    fetch(`${BASE}/threads/${threadId}/messages/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }),

  getTasks: (date?: string) => fetch(`${BASE}/tasks/${date ? `?date=${date}` : ''}`).then(r => r.json()),
  createTask: (body: { title: string; date: string }) =>
    fetch(`${BASE}/tasks/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  updateTask: (id: string, body: any) =>
    fetch(`${BASE}/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  deleteTask: (id: string) => fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' }).then(r => r.json()),
}
