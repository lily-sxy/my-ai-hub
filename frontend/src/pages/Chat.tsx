import { Stack, Text, TextInput, ActionIcon, Group, ScrollArea, Paper, Select, Center } from '@mantine/core'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useState, useRef, useEffect } from 'react'

const PLANNER_KEYWORDS = ['planner', 'calendar', 'task', 'remind me', 'schedule', 'todo']

export function Chat() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showPlannerBanner, setShowPlannerBanner] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => api.getMessages(threadId!),
    enabled: !!threadId,
  })

  const { data: thread } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => api.getThreads().then((ts: any[]) => ts.find(t => t.id === threadId)),
    enabled: !!threadId,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (thread?.model) setSelectedModel(thread.model)
  }, [thread?.model])

  const sendMessage = async () => {
    if (!input.trim() || !threadId || isStreaming) return
    const text = input.trim()
    setInput('')

    const hasPlanner = PLANNER_KEYWORDS.some(k => text.toLowerCase().includes(k))
    if (hasPlanner) setShowPlannerBanner(true)

    setIsStreaming(true)
    setStreaming('')

    const res = await api.sendMessage(threadId, text, selectedModel)
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let full = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const word = line.slice(6)
          if (word === '[DONE]') break
          full += word
          setStreaming(full)
        }
      }
    }

    setIsStreaming(false)
    setStreaming('')
    qc.invalidateQueries({ queryKey: ['messages', threadId] })
    qc.invalidateQueries({ queryKey: ['threads'] })
  }

  if (!threadId) {
    return (
      <Center h="100%" style={{ flexDirection: 'column', gap: 8 }}>
        <Text size="xl">💬</Text>
        <Text c="dimmed">Select a chat from the sidebar or create a new one</Text>
      </Center>
    )
  }

  return (
    <Stack h="calc(100vh - 48px)" gap={0}>
      {/* Header */}
      <Group px="md" py="xs" style={{ borderBottom: '1px solid #eee' }} justify="space-between">
        <Text fw={600} size="sm">{thread?.title || 'Chat'}</Text>
        <Select
          size="xs"
          value={selectedModel}
          data={[{ value: 'claude', label: 'Claude' }, { value: 'gpt-4o', label: 'GPT-4o' }]}
          onChange={val => val && setSelectedModel(val)}
          style={{ width: 120 }}
        />
      </Group>

      {/* Planner banner */}
      {showPlannerBanner && (
        <Group px="md" py="xs" style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }} justify="space-between">
          <Text size="xs" c="green">📅 Looks like you mentioned a task — want to go to Planner?</Text>
          <Group gap={6}>
            <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/planner')}>Go to Planner</Text>
            <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }} onClick={() => setShowPlannerBanner(false)}>Dismiss</Text>
          </Group>
        </Group>
      )}

      {/* Messages */}
      <ScrollArea flex={1} px="md" py="sm">
        <Stack gap="xs">
          {messages.map((m: any) => (
            <Group key={m.id} justify={m.role === 'user' ? 'flex-end' : 'flex-start'}>
              <Paper
                px="sm" py="xs" radius="md"
                style={{
                  maxWidth: '70%',
                  background: m.role === 'user' ? '#4f46e5' : '#f5f5f5',
                  color: m.role === 'user' ? '#fff' : '#000',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Text size="sm">{m.content}</Text>
              </Paper>
            </Group>
          ))}
          {isStreaming && (
            <Group justify="flex-start">
              <Paper px="sm" py="xs" radius="md" style={{ maxWidth: '70%', background: '#f5f5f5', whiteSpace: 'pre-wrap' }}>
                <Text size="sm">{streaming || '...'}</Text>
              </Paper>
            </Group>
          )}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Group px="md" py="sm" style={{ borderTop: '1px solid #eee' }} gap="xs">
        <TextInput
          flex={1}
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isStreaming}
        />
        <ActionIcon size="lg" color="indigo" variant="filled" onClick={sendMessage} disabled={isStreaming || !input.trim()}>
          ➤
        </ActionIcon>
      </Group>
    </Stack>
  )
}
