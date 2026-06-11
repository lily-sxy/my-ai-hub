import { SimpleGrid, Card, Text, Group, Badge, ActionIcon, Button, Title, Stack, TextInput } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useState } from 'react'

export function Desktop() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: threads = [] } = useQuery({ queryKey: ['threads'], queryFn: api.getThreads })
  const deleteThread = useMutation({
    mutationFn: api.deleteThread,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threads'] }),
  })
  const createThread = useMutation({
    mutationFn: api.createThread,
    onSuccess: (t) => { qc.invalidateQueries({ queryKey: ['threads'] }); navigate(`/chat/${t.id}`) },
  })

  const filtered = threads.filter((t: any) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.summary || '').toLowerCase().includes(search.toLowerCase())
  )

  const modelColor: Record<string, string> = { claude: 'indigo', 'gpt-4o': 'green' }

  return (
    <Stack p="lg" gap="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Good day, Lily 👋</Title>
          <Text c="dimmed" size="sm">{threads.length} active threads</Text>
        </div>
        <Group>
          <TextInput placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)} size="sm" />
          <Button color="indigo" onClick={() => createThread.mutate({ title: 'New Chat', model: 'claude' })}>
            + New Chat
          </Button>
        </Group>
      </Group>

      {filtered.length === 0 && (
        <Text c="dimmed" ta="center" mt="xl">No chats yet — start a new one!</Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
        {filtered.map((t: any) => (
          <Card
            key={t.id}
            withBorder
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/chat/${t.id}`)}
          >
            <Group justify="space-between" mb={4} wrap="nowrap">
              <Text fw={600} size="sm" lineClamp={1} style={{ flex: 1 }}>{t.title}</Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={e => { e.stopPropagation(); deleteThread.mutate(t.id) }}
              >✕</ActionIcon>
            </Group>
            <Text size="xs" c="dimmed" lineClamp={2} mb={8}>
              {t.summary || 'No summary yet'}
            </Text>
            <Group justify="space-between">
              <Badge size="xs" color={modelColor[t.model] || 'gray'}>{t.model}</Badge>
              <Text size="xs" c="dimmed">{new Date(t.created_at).toLocaleDateString()}</Text>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
