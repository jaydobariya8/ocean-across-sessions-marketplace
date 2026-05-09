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

const STATUS_COLOR = { draft: 'gray', published: 'green', cancelled: 'red' } as const

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
      .then(([s, b]) => { setSessions(s.data.results); setBookings(b.data.results) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this session? This cannot be undone.')) return
    try {
      await api.delete(`/sessions/${id}/`)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Session deleted.')
    } catch { toast.error('Failed to delete.') }
  }

  const handleSaved = (saved: Session) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
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
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Studio</h1>
          <p className="text-gray-500 text-sm mt-1">
            <span className="font-medium text-gray-700">{user?.first_name || user?.username}</span>
            {' '}· Creator account
          </p>
        </div>
        <button
          onClick={() => { setEditSession(null); setFormOpen(true) }}
          className="btn-primary text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Total Sessions" value={sessions.length} gradient="from-blue-500 to-indigo-500" />
        <StatCard icon="🟢" label="Published" value={published} gradient="from-emerald-500 to-teal-500" />
        <StatCard icon="📦" label="Bookings" value={totalBookings} gradient="from-violet-500 to-purple-500" />
        <StatCard icon="💰" label="Revenue" value={`$${revenue.toFixed(2)}`} gradient="from-amber-500 to-orange-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['sessions', 'bookings'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'sessions' ? `Sessions (${sessions.length})` : `Bookings (${totalBookings})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tab === 'sessions' ? (
        <SessionsTab sessions={sessions}
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
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <div className="text-5xl mb-4">🎬</div>
        <h3 className="font-semibold text-gray-800 mb-2">No sessions yet</h3>
        <p className="text-gray-400 text-sm">Create your first session to start earning.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s.id} className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 flex items-center gap-4">
          {/* Thumb */}
          <div className="w-16 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-violet-200 flex-shrink-0">
            {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link href={`/sessions/${s.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm truncate">
                {s.title}
              </Link>
              <Badge label={s.status} color={STATUS_COLOR[s.status]} />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
              <span>{format(new Date(s.scheduled_at), 'MMM d, yyyy • h:mm a')}</span>
              <span className="font-semibold text-gray-600">${Number(s.price).toFixed(2)}</span>
              <span>{s.current_participants}/{s.max_participants} booked</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onEdit(s)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-all">
              Edit
            </button>
            <button onClick={() => onDelete(s.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  const STATUS_CONFIG = {
    pending:   'bg-amber-50 text-amber-700',
    confirmed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-gray-100 text-gray-500',
    completed: 'bg-blue-50 text-blue-700',
  } as const

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <div className="text-5xl mb-4">📦</div>
        <h3 className="font-semibold text-gray-800 mb-2">No bookings yet</h3>
        <p className="text-gray-400 text-sm">Bookings for your sessions will appear here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3.5 font-semibold">User</th>
              <th className="px-5 py-3.5 font-semibold">Session</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Amount</th>
              <th className="px-5 py-3.5 font-semibold">Booked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {b.user.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{b.user.username}</span>
                  </div>
                </td>
                <td className="px-5 py-4 max-w-xs">
                  <Link href={`/sessions/${b.session.id}`} className="text-gray-600 hover:text-primary-600 transition-colors truncate block">
                    {b.session.title}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-800">${Number(b.amount_paid).toFixed(2)}</td>
                <td className="px-5 py-4 text-gray-400">{format(new Date(b.booked_at), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, gradient }: { icon: string; label: string; value: string | number; gradient: string }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-5 rounded-full -translate-y-6 translate-x-6`} />
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
