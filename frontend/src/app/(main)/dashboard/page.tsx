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
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      api.get<PaginatedResponse<Booking>>('/bookings/?status=active&page_size=100'),
      api.get<PaginatedResponse<Booking>>('/bookings/?page_size=200'),
    ])
      .then(([activeRes, allRes]) => {
        setBookings(activeRes.data.results)
        setAllBookings(allRes.data.results)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const switchTab = (t: Tab) => {
    setTab(t)
    setLoading(true)
    api.get<PaginatedResponse<Booking>>(`/bookings/?status=${t}&page_size=100`)
      .then(({ data }) => setBookings(data.results))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleCancelled = (id: number) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
    setAllBookings((prev) => prev.filter((b) => b.id !== id))
  }

  if (authLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const activeCount = allBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length
  const totalSpent = allBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.amount_paid), 0)
  const completedCount = allBookings.filter(b => b.status === 'completed').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-medium text-gray-700">{user?.first_name || user?.username}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="btn-secondary text-sm py-2 px-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
          <Link href="/" className="btn-primary text-sm py-2 px-4">
            Browse Sessions
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon="📅" label="Active Bookings" value={activeCount} gradient="from-blue-500 to-indigo-600" />
        <StatCard icon="💰" label="Total Spent" value={`$${totalSpent.toFixed(2)}`} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon="🎓" label="Completed" value={completedCount} gradient="from-violet-500 to-purple-600" />
      </div>

      {/* Become creator banner */}
      {user?.role === 'user' && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-5 mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-white text-sm">🚀 Want to host sessions?</p>
              <p className="text-primary-100 text-xs mt-1">Switch to Creator to share your expertise and earn.</p>
            </div>
            <Link href="/profile" className="flex-shrink-0 bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors">
              Become a Creator
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['active', 'past'] as Tab[]).map((t) => (
          <button key={t} onClick={() => switchTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'active' ? 'Active' : 'Past'} Bookings
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">{tab === 'active' ? '📅' : '🎓'}</div>
          <h3 className="font-semibold text-gray-800 mb-2">No {tab} bookings</h3>
          <p className="text-gray-400 text-sm mb-6">
            {tab === 'active' ? 'Book a session to get started.' : 'Your completed sessions will appear here.'}
          </p>
          {tab === 'active' && (
            <Link href="/" className="btn-primary text-sm">
              Browse Sessions
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancelled={handleCancelled} />
          ))}
        </div>
      )}
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
