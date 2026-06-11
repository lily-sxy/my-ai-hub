import { AppShell as MantineAppShell, Group, Text, NavLink } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { Sidebar } from '../Sidebar/Sidebar'

const navItems = [
  { path: '/desktop', label: 'Desktop', icon: '🖥' },
  { path: '/chat',    label: 'Chat',    icon: '💬' },
  { path: '/planner', label: 'Planner', icon: '📅' },
  { path: '/trash',   label: 'Trash',   icon: '🗑' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <MantineAppShell
      header={{ height: 48 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding={0}
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" gap="xs">
          <Text fw={800} size="md" c="indigo">✦ MyAI</Text>
          <Group gap={4} ml="sm">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                label={`${item.icon} ${item.label}`}
                active={location.pathname.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                styles={{ root: { borderRadius: 6, padding: '4px 10px', width: 'auto' } }}
              />
            ))}
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
