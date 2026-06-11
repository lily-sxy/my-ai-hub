import { Group, Text, ActionIcon, Tooltip } from '@mantine/core'

interface Props {
  thread: any
  active: boolean
  onOpen: () => void
  onDelete: () => void
}

export function ThreadRow({ thread, active, onOpen, onDelete }: Props) {
  return (
    <Group
      gap={4}
      px={6}
      py={3}
      style={{ borderRadius: 6, cursor: 'grab', background: active ? '#e8eaff' : undefined }}
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
