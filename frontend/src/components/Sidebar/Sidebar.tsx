import { Stack, Text, ActionIcon, Group, TextInput, Button, Tooltip } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useState } from 'react'

export function Sidebar() {
  const navigate = useNavigate()
  const { threadId } = useParams()
  const qc = useQueryClient()
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)

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
    if (folderId === 'trash') {
      deleteThread.mutate(id)
    } else {
      moveThread.mutate({ id, folder_id: folderId })
    }
  }

  const ungrouped = threads.filter((t: any) => !t.folder_id)

  return (
    <Stack gap={4} h="100%">
      <Button
        size="xs"
        variant="light"
        color="indigo"
        fullWidth
        onClick={() => createThread.mutate({ title: 'New Chat', model: 'claude' })}
      >
        + New Chat
      </Button>

      {/* Ungrouped threads */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, null)}
        style={{ minHeight: 8 }}
      >
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
        <div key={f.id}>
          <Text size="xs" fw={700} c="dimmed" px={6} mt={6}>📁 {f.name}</Text>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, f.id)}
            style={{ minHeight: 24, borderRadius: 6, padding: '2px 0' }}
          >
            {threads.filter((t: any) => t.folder_id === f.id).map((t: any) => (
              <ThreadRow
                key={t.id}
                thread={t}
                active={t.id === threadId}
                onOpen={() => navigate(`/chat/${t.id}`)}
                onDelete={() => deleteThread.mutate(t.id)}
                indent
              />
            ))}
          </div>
        </div>
      ))}

      {/* Trash drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, 'trash')}
        style={{ marginTop: 'auto', borderRadius: 6, padding: '6px 8px', border: '1px dashed #ddd', textAlign: 'center', cursor: 'default' }}
      >
        <Text size="xs" c="dimmed">🗑 Drop here to trash</Text>
      </div>

      {/* Add folder */}
      {addingFolder ? (
        <Group gap={4}>
          <TextInput
            size="xs"
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder.mutate({ name: newFolderName })}
            style={{ flex: 1 }}
            autoFocus
          />
          <ActionIcon size="sm" variant="light" onClick={() => createFolder.mutate({ name: newFolderName })}>✓</ActionIcon>
          <ActionIcon size="sm" variant="subtle" onClick={() => setAddingFolder(false)}>✕</ActionIcon>
        </Group>
      ) : (
        <Text size="xs" c="dimmed" style={{ cursor: 'pointer', padding: '2px 6px' }} onClick={() => setAddingFolder(true)}>
          + New folder
        </Text>
      )}
    </Stack>
  )
}

function ThreadRow({ thread, active, onOpen, onDelete, indent = false }: any) {
  return (
    <Group
      gap={4}
      px={indent ? 16 : 6}
      py={3}
      style={{ borderRadius: 6, cursor: 'grab', background: active ? '#e8eaff' : undefined }}
      draggable
      onDragStart={e => e.dataTransfer.setData('threadId', thread.id)}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '' }}
    >
      <Text size="xs" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={onOpen}>
        {thread.title}
      </Text>
      <Tooltip label="Delete" withArrow>
        <ActionIcon size="xs" variant="subtle" color="red" onClick={e => { e.stopPropagation(); onDelete() }}>✕</ActionIcon>
      </Tooltip>
    </Group>
  )
}
