import { Stack, Text, Group, Card, Button, Title, Badge } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export function Trash() {
  const qc = useQueryClient()

  const { data: deleted = [] } = useQuery({
    queryKey: ['threads-deleted'],
    queryFn: api.getDeletedThreads,
  })

  const restore = useMutation({
    mutationFn: api.restoreThread,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['threads-deleted'] })
      qc.invalidateQueries({ queryKey: ['threads'] })
    },
  })

  const purge = useMutation({
    mutationFn: (id: string) => fetch(`http://localhost:8000/threads/${id}/permanent`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threads-deleted'] }),
  })

  return (
    <Stack p="lg" gap="md">
      <div>
        <Title order={2}>🗑 Trash</Title>
        <Text c="dimmed" size="sm">Chats deleted within 30 days can be restored</Text>
      </div>

      {deleted.length === 0 && (
        <Text c="dimmed" ta="center" mt="xl">Trash is empty</Text>
      )}

      <Stack gap="xs">
        {deleted.map((t: any) => (
          <Card key={t.id} withBorder radius="md">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="sm">{t.title}</Text>
                <Text size="xs" c="dimmed">
                  Deleted {new Date(t.deleted_at).toLocaleDateString()} ·{' '}
                  {daysLeft(t.deleted_at)} days left to restore
                </Text>
              </div>
              <Group gap="xs">
                <Badge color={t.model === 'claude' ? 'indigo' : 'green'} size="xs">{t.model}</Badge>
                <Button size="xs" variant="light" color="indigo" onClick={() => restore.mutate(t.id)}>
                  Restore
                </Button>
                <Button size="xs" variant="light" color="red" onClick={() => purge.mutate(t.id)}>
                  Delete forever
                </Button>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

function daysLeft(deletedAt: string) {
  const diff = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000)
  return Math.max(0, diff)
}
