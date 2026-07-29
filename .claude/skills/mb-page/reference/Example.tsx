// Example page — copy to pages/users/page.tsx and adapt.
// Demonstrates the standard shape: named `meta` (with title/description) + default
// component, @mspbots/ui components, $fetch for data, and role-gated actions.
// No shell wrapper — the layout provides a padded, scrollable container.

import { useEffect, useState } from 'react'
import {
  Button,
  Permission,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@mspbots/ui'
import { Plus } from 'lucide-react'

export const meta = {
  label: 'Users', // sidebar + breadcrumb + browser tab title
  description: 'Manage team members and their roles', // HTML meta description
  icon: 'Users', // lucide-react icon name
  order: 2,
  menu: true,
  route: true, // or ['admin'] to restrict
}

interface User {
  id: string
  name: string
  email: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await $fetch('/api/users') // → GET {BASE_URL}/api/users, Bearer token auto-attached
        const body = await res.json()
        if (alive) setUsers(body.items ?? body.data ?? [])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage team members and their roles</p>
        </div>
        <Permission roles={['admin']} fallback={null}>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add user
          </Button>
        </Permission>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Spinner /> Loading…
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
