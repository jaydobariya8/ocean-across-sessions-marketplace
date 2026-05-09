'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { api } from '@/lib/api'
import SessionForm from '@/components/sessions/SessionForm'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import type { Session, Booking, PaginatedResponse } from '@/types'

type Tab = 'sessions' | 'bookings'

const STATUS_COLOR = {
  draft: 'gray', published: 'green', cancelled: 'red',
} as const

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useRequireAuth('creator')
  const [tab, setTab] = useState<Tab>('sessions')
  const [sessions, setSessions] = useState<Session[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editSession, setEditSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      api.get<PaginatedResponse<Session>>('/sessions/my/?page_size=100'),
      api.get<PaginatedResponse<Booking>>('/bookings/creator/?page_size=100'),
    ])
      .then(([sessionsRes, bookingsRes]) => {
        setSessions(sessionsRes.data.results)
        setBookings(bookingsRes.data.results)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this session? This cannot be undone.')) return
    try {
      await api.delete(`/sessions/${id}/`)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Session deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleSaved = (saved: Session) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  if (authLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const published = sessions.filter((s) => s.status === 'published').length
  const totalBookings = bookings.length
  const revenue = bookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((s, b) => s + Number(b.amount_paid), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.first_name || user?.username}</p>
        </div>
        <button onClick={() => { setEditSession(null); setFormOpen(true) }} className="btn-primary">
          + New Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sessions" value={sessions.length} color="blue" />
        <StatCard label="Published" value={published} color="green" />
        <StatCard label="Total Bookings" value={totalBookings} color="purple" />
        <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} color="yellow" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(['sessions', 'bookings'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'sessions' ? `My Sessions (${sessions.length})` : `Bookings (${totalBookings})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tab === 'sessions' ? (
        <SessionsTab
          sessions={sessions}
          onEdit={(s) => { setEditSession(s); setFormOpen(true) }}
          onDelete={handleDelete}
        />
      ) : (
        <BookingsTab bookings={bookings} />
      )}

      <SessionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        session={editSession}
        onSaved={handleSaved}
      />
    </div>
  )
}

function SessionsTab({ sessions, onEdit, onDelete }: {
  sessions: Session[]
  onEdit: (s: Session) => void
  onDelete: (id: number) => void
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-gray-400">No sessions yet. Create your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s.id} className="card p-5 flex items-center gap-4">
          {/* Thumb */}
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-blue-200 flex-shrink-0">
            {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : null}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/sessions/${s.id}`} className="font-semibold text-gray-900 hover:text-primary-600 truncate">
                {s.title}
              </Link>
              <Badge label={s.status} color={STATUS_COLOR[s.status]} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {format(new Date(s.scheduled_at), 'PPP • p')} · ${Number(s.price).toFixed(2)} ·{' '}
              {s.current_participants}/{s.max_participants} booked
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onEdit(s)} className="btn-secondary text-sm px-3 py-1.5">Edit</button>
            <button onClick={() => onDelete(s.id)} className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 hover:border-red-400 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  const STATUS_COLOR2 = { pending: 'yellow', confirmed: 'green', cancelled: 'gray', completed: 'blue' } as const

  if (bookings.length === 0) {
    return <div className="text-center py-16 text-gray-400">No bookings yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-400 text-xs uppercase tracking-wide">
            <th className="pb-3 font-medium">User</th>
            <th className="pb-3 font-medium">Session</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Booked At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="py-3 font-medium text-gray-800">{b.user.username}</td>
              <td className="py-3 text-gray-600 max-w-xs truncate">
                <Link href={`/sessions/${b.session.id}`} className="hover:text-primary-600">{b.session.title}</Link>
              </td>
              <td className="py-3">
                <Badge label={b.status} color={STATUS_COLOR2[b.status]} />
              </td>
              <td className="py-3 font-medium text-gray-800">${Number(b.amount_paid).toFixed(2)}</td>
              <td className="py-3 text-gray-400">{format(new Date(b.booked_at), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700', yellow: 'bg-yellow-50 text-yellow-700',
  }
  return (
    <div className={`rounded-xl p-4 ${bg[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-75">{label}</p>
    </div>
  )
}
