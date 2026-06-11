import { Stack, Group, Text, Title, Checkbox, ActionIcon, TextInput, Button, Paper } from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useState } from 'react'
import dayjs from 'dayjs'

export function Planner() {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [newTask, setNewTask] = useState('')
  const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', dateStr],
    queryFn: () => api.getTasks(dateStr),
  })

  const createTask = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', dateStr] }); setNewTask('') },
  })

  const updateTask = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.updateTask(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', dateStr] }),
  })

  const deleteTask = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', dateStr] }),
  })

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')
  const done = tasks.filter((t: any) => t.done).length

  return (
    <Group align="flex-start" p="lg" gap="xl">
      <Stack>
        <Text fw={700} size="sm">📅 June 2026</Text>
        <Calendar defaultDate={selectedDate} getDayProps={(date) => ({
            selected: dayjs(date).isSame(selectedDate, 'day'),
            onClick: () => setSelectedDate(new Date(date)),
          })} />
      </Stack>

      <Stack flex={1} gap="md">
        <div>
          <Title order={3}>{isToday ? 'Today' : dayjs(selectedDate).format('MMM D, YYYY')}</Title>
          <Text size="sm" c="dimmed">{done}/{tasks.length} tasks done</Text>
        </div>

        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            {tasks.length === 0 && (
              <Text size="sm" c="dimmed">No tasks for this day yet</Text>
            )}
            {tasks.map((t: any) => (
              <Group key={t.id} justify="space-between">
                <Group gap="xs">
                  <Checkbox
                    checked={t.done}
                    onChange={e => updateTask.mutate({ id: t.id, body: { done: e.target.checked } })}
                  />
                  <Text size="sm" td={t.done ? 'line-through' : undefined} c={t.done ? 'dimmed' : undefined}>
                    {t.title}
                  </Text>
                </Group>
                <ActionIcon size="xs" variant="subtle" color="red" onClick={() => deleteTask.mutate(t.id)}>✕</ActionIcon>
              </Group>
            ))}
          </Stack>
        </Paper>

        <Group gap="xs">
          <TextInput
            flex={1}
            placeholder="Add a task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newTask.trim() && createTask.mutate({ title: newTask, date: dateStr })}
          />
          <Button
            color="green"
            onClick={() => newTask.trim() && createTask.mutate({ title: newTask, date: dateStr })}
          >
            Add
          </Button>
        </Group>
      </Stack>
    </Group>
  )
}
