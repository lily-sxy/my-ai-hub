import { Group, Text, ActionIcon, Tooltip } from '@mantine/core'
import { useState } from 'react'
import { ThreadRow } from './ThreadRow'

interface Props {
  folder: any
  threads: any[]
  activeThreadId?: string
  onOpenThread: (id: string) => void
  onDeleteThread: (id: string) => void
  onDeleteFolder: (id: string) => void
  onDrop: (e: React.DragEvent, folderId: string) => void
}

export function FolderItem({
  folder,
  threads,
  activeThreadId,
  onOpenThread,
  onDeleteThread,
  onDeleteFolder,
  onDrop,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)

  return (
    <div>
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
          transition: 'all 0.15s',
        }}
        onDragOver={e => { e.preventDefault(); setIsDropTarget(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDropTarget(false) }}
        onDrop={e => { setIsDropTarget(false); onDrop(e, folder.id) }}
      >
        {/* Chevron */}
        <Text
          size="xs"
          c="dimmed"
          style={{
            transition: 'transform 0.15s',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
            lineHeight: 1,
            userSelect: 'none',
            width: 12,
            textAlign: 'center',
          }}
          onClick={() => setCollapsed(c => !c)}
        >
          ›
        </Text>

        {/* Folder name */}
        <Text
          size="xs"
          fw={600}
          style={{ flex: 1, userSelect: 'none' }}
          onClick={() => setCollapsed(c => !c)}
        >
          📁 {folder.name}
        </Text>

        {/* Thread count */}
        {threads.length > 0 && (
          <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
            {threads.length}
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
              if (confirm(`Delete folder "${folder.name}"? Chats inside will become ungrouped.`)) {
                onDeleteFolder(folder.id)
              }
            }}
          >
            ✕
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Folder contents */}
      {!collapsed && (
        <div
          style={{
            borderLeft: '2px solid #e8e8e8',
            marginLeft: 10,
            paddingLeft: 4,
            minHeight: threads.length === 0 ? 24 : undefined,
          }}
        >
          {threads.length === 0 && (
            <Text size="xs" c="dimmed" px={6} py={2} style={{ fontStyle: 'italic' }}>
              Drop chats here
            </Text>
          )}
          {threads.map(t => (
            <ThreadRow
              key={t.id}
              thread={t}
              active={t.id === activeThreadId}
              onOpen={() => onOpenThread(t.id)}
              onDelete={() => onDeleteThread(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
