import { Stack, Text, Group, TextInput, Button, ActionIcon } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api/client'
import { FolderItem } from './FolderItem'
import { ThreadRow } from './ThreadRow'

export function Sidebar() {
  const navigate = useNavigate()
  const { threadId } = useParams()
  const qc = useQueryClient()
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [trashHover, setTrashHover] = useState(false)

  const { data: folders = [] } = useQuery({ queryKey: ['folders'], queryFn: api.getFolders })
  const { data: threads = [] } = useQuery({ queryKey: ['threads'], queryFn: api.getThreads })

  const createThread = useMutation({
    mutationFn: api.createThread,
    onSuccess: (t) => { qc.invalidateQueries({ queryKey: ['threads'] }); navigate(`/chat/${t.id}`) },
  })
  const deleteThread = useMutation({
    mutationFn: api.deleteThread,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threads'] }),
  })
  const deleteFolder = useMutation({
    mutationFn: api.deleteFolder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  })
  const moveThread = useMutation({
    mutationFn: ({ id, folder_id }: { id: string; folder_id: string | null }) =>
      api.updateThread(id, { folder_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threads'] }),
  })
  const createFolder = useMutation({
    mutationFn: api.createFolder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['folders'] }); setNewFolderName(''); setAddingFolder(false) },
  })

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('threadId')
    if (!id) return
    moveThread.mutate({ id, folder_id: folderId })
  }

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setTrashHover(false)
    const id = e.dataTransfer.getData('threadId')
    if (id) deleteThread.mutate(id)
  }

  const ungrouped = threads.filter((t: any) => !t.folder_id)

  return (
    <Stack gap={4} h="100%" style={{ overflow: 'auto' }}>
      <Button size="xs" variant="light" color="indigo" fullWidth
        onClick={() => createThread.mutate({ title: 'New Chat', model: 'claude' })}>
        + New Chat
      </Button>

      {/* Ungrouped threads */}
      <div onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, null)} style={{ minHeight: 8 }}>
        {ungrouped.map((t: any) => (
          <ThreadRow
            key={t.id}
            thread={t}
            active={t.id === threadId}
            onOpen={() => navigate(`/chat/${t.id}`)}
            onDelete={() => deleteThread.mutate(t.id)}
          />
        ))}
      </div>

      {/* Folders */}
      {folders.map((f: any) => (
        <FolderItem
          key={f.id}
          folder={f}
          threads={threads.filter((t: any) => t.folder_id === f.id)}
          activeThreadId={threadId}
          onOpenThread={id => navigate(`/chat/${id}`)}
          onDeleteThread={id => deleteThread.mutate(id)}
          onDeleteFolder={id => deleteFolder.mutate(id)}
          onDrop={handleDrop}
        />
      ))}

      {/* Trash drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setTrashHover(true) }}
        onDragLeave={() => setTrashHover(false)}
        onDrop={handleTrashDrop}
        style={{
          marginTop: 'auto',
          borderRadius: 6,
          padding: '6px 8px',
          border: trashHover ? '1px dashed #ef4444' : '1px dashed #ddd',
          background: trashHover ? '#fff1f2' : undefined,
          textAlign: 'center',
          transition: 'all 0.15s',
        }}
      >
        <Text size="xs" c={trashHover ? 'red' : 'dimmed'}>🗑 Drop here to trash</Text>
      </div>

      {/* Add folder */}
      {addingFolder ? (
        <Group gap={4}>
          <TextInput
            size="xs"
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newFolderName.trim()) createFolder.mutate({ name: newFolderName })
              if (e.key === 'Escape') setAddingFolder(false)
            }}
            style={{ flex: 1 }}
            autoFocus
          />
          <ActionIcon size="sm" variant="light" color="indigo"
            onClick={() => newFolderName.trim() && createFolder.mutate({ name: newFolderName })}>✓</ActionIcon>
          <ActionIcon size="sm" variant="subtle" onClick={() => setAddingFolder(false)}>✕</ActionIcon>
        </Group>
      ) : (
        <Text size="xs" c="dimmed" style={{ cursor: 'pointer', padding: '2px 6px' }}
          onClick={() => setAddingFolder(true)}>
          + New folder
        </Text>
      )}
    </Stack>
  )
}
