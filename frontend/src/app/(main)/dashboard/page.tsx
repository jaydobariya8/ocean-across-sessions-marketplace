'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { api } from '@/lib/api'
import BookingCard from '@/components/bookings/BookingCard'
import Spinner from '@/components/ui/Spinner'
import type { Booking, PaginatedResponse } from '@/types'

type Tab = 'active' | 'past'

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [tab, setTab] = useState<Tab>('active')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get<PaginatedResponse<Booking>>(`/bookings/?status=${tab}&page_size=50`)
      .then(({ data }) => setBookings(data.results))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, tab])

  const handleCancelled = (id: number) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  if (authLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.first_name || user?.username}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="btn-secondary text-sm">Edit Profile</Link>
          {user?.role === 'user' && (
            <Link href="/" className="btn-primary text-sm">Browse Sessions</Link>
          )}
        </div>
      </div>

      {/* Role banner — invite to become creator */}
      {user?.role === 'user' && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800 text-sm">Want to host sessions?</p>
            <p className="text-gray-500 text-xs mt-0.5">Switch to Creator role to create and manage sessions.</p>
          </div>
          <Link href="/profile" className="btn-primary text-sm whitespace-nowrap">Become a Creator</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Bookings" value={tab === 'active' ? bookings.length : '—'} color="blue" />
        <StatCard label="Total Spent" value={`$${bookings.reduce((s, b) => s + Number(b.amount_paid), 0).toFixed(2)}`} color="green" />
        <StatCard label="Sessions Attended" value={tab === 'past' ? bookings.filter(b => b.status === 'completed').length : '—'} color="purple" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(['active', 'past'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t} Bookings
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">No {tab} bookings yet.</p>
          {tab === 'active' && (
            <Link href="/" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              Browse sessions →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancelled={handleCancelled} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-4 ${bg[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-75">{label}</p>
    </div>
  )
}
