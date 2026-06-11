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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [dropTarget, setDropTarget] = useState<string | null>(null)

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

  const handleDrop = (e: React.DragEvent, folderId: string | null | 'trash') => {
    e.preventDefault()
    setDropTarget(null)
    const id = e.dataTransfer.getData('threadId')
    if (!id) return
    if (folderId === 'trash') {
      deleteThread.mutate(id)
    } else {
      moveThread.mutate({ id, folder_id: folderId })
    }
  }

  const toggleCollapse = (folderId: string) =>
    setCollapsed(prev => ({ ...prev, [folderId]: !prev[folderId] }))

  const ungrouped = threads.filter((t: any) => !t.folder_id)

  return (
    <Stack gap={4} h="100%" style={{ overflow: 'auto' }}>
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
      {folders.map((f: any) => {
        const isCollapsed = collapsed[f.id]
        const folderThreads = threads.filter((t: any) => t.folder_id === f.id)
        const isDropTarget = dropTarget === f.id

        return (
          <div key={f.id}>
            {/* Folder header */}
            <Group
              gap={2}
              px={4}
              py={3}
              mt={4}
              style={{
                borderRadius: 6,
                cursor: 'pointer',
                background: isDropTarget ? '#eef2ff' : undefined,
                border: isDropTarget ? '1px dashed #6366f1' : '1px solid transparent',
              }}
              onDragOver={e => { e.preventDefault(); setDropTarget(f.id) }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null) }}
              onDrop={e => handleDrop(e, f.id)}
            >
              {/* Chevron */}
              <Text
                size="xs"
                c="dimmed"
                style={{
                  transition: 'transform 0.15s',
                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
                onClick={() => toggleCollapse(f.id)}
              >
                ›
              </Text>

              {/* Folder name */}
              <Text
                size="xs"
                fw={600}
                style={{ flex: 1, userSelect: 'none' }}
                onClick={() => toggleCollapse(f.id)}
              >
                📁 {f.name}
              </Text>

              {/* Thread count badge */}
              {folderThreads.length > 0 && (
                <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                  {folderThreads.length}
                </Text>
              )}

              {/* Delete folder */}
              <Tooltip label="Delete folder" withArrow>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm(`Delete folder "${f.name}"? Chats inside will become ungrouped.`)) {
                      deleteFolder.mutate(f.id)
                    }
                  }}
                >
                  ✕
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Folder contents */}
            {!isCollapsed && (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, f.id)}
                style={{
                  borderLeft: '2px solid #e8e8e8',
                  marginLeft: 10,
                  paddingLeft: 4,
                  minHeight: folderThreads.length === 0 ? 24 : undefined,
                }}
              >
                {folderThreads.length === 0 && (
                  <Text size="xs" c="dimmed" px={6} py={2} style={{ fontStyle: 'italic' }}>
                    Drop chats here
                  </Text>
                )}
                {folderThreads.map((t: any) => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    active={t.id === threadId}
                    onOpen={() => navigate(`/chat/${t.id}`)}
                    onDelete={() => deleteThread.mutate(t.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Trash drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDropTarget('trash') }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={e => handleDrop(e, 'trash')}
        style={{
          marginTop: 'auto',
          borderRadius: 6,
          padding: '6px 8px',
          border: dropTarget === 'trash' ? '1px dashed #ef4444' : '1px dashed #ddd',
          background: dropTarget === 'trash' ? '#fff1f2' : undefined,
          textAlign: 'center',
          cursor: 'default',
          transition: 'all 0.15s',
        }}
      >
        <Text size="xs" c={dropTarget === 'trash' ? 'red' : 'dimmed'}>
          🗑 Drop here to trash
        </Text>
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
          <ActionIcon size="sm" variant="light" color="indigo" onClick={() => newFolderName.trim() && createFolder.mutate({ name: newFolderName })}>✓</ActionIcon>
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

function ThreadRow({ thread, active, onOpen, onDelete }: any) {
  return (
    <Group
      gap={4}
      px={6}
      py={3}
      style={{
        borderRadius: 6,
        cursor: 'grab',
        background: active ? '#e8eaff' : undefined,
      }}
      draggable
      onDragStart={e => e.dataTransfer.setData('threadId', thread.id)}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '' }}
    >
      <Text
        size="xs"
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        onClick={onOpen}
      >
        {thread.title}
      </Text>
      <Tooltip label="Delete" withArrow>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="red"
          onClick={e => { e.stopPropagation(); onDelete() }}
        >
          ✕
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}
