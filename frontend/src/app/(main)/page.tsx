'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import SessionCard from '@/components/sessions/SessionCard'
import Spinner from '@/components/ui/Spinner'
import type { Session, PaginatedResponse } from '@/types'

const CATEGORIES = [
  { value: 'all',      label: 'All',       emoji: '✨' },
  { value: 'tech',     label: 'Tech',      emoji: '💻' },
  { value: 'coaching', label: 'Coaching',  emoji: '🎯' },
  { value: 'fitness',  label: 'Fitness',   emoji: '💪' },
  { value: 'wellness', label: 'Wellness',  emoji: '🧘' },
  { value: 'business', label: 'Business',  emoji: '📈' },
  { value: 'tutoring', label: 'Tutoring',  emoji: '📚' },
  { value: 'music',    label: 'Music',     emoji: '🎵' },
  { value: 'art',      label: 'Art',       emoji: '🎨' },
  { value: 'other',    label: 'Other',     emoji: '🌟' },
]

const PAGE_SIZE = 12

export default function CatalogPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, category])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (category !== 'all') params.set('category', category)
      params.set('page', String(page))
      const { data } = await api.get<PaginatedResponse<Session>>(`/sessions/?${params}`)
      setSessions(data.results)
      setTotalCount(data.count)
    } catch {
      setError('Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, page])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {!user && (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-300 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Expert-led sessions, live now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Learn from the best.<br />
              <span className="text-primary-200">Book in seconds.</span>
            </h1>
            <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
              Browse coaching, tutoring, fitness, and tech sessions — all live, all expert-led.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all duration-200 text-base">
                Get Started — It&apos;s Free
              </Link>
              <a href="#catalog" className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors">
                Browse sessions
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {[['Live Sessions', '100+'], ['Expert Creators', '50+'], ['Happy Learners', '1k+']].map(([label, val]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-white">{val}</div>
                  <div className="text-primary-200 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catalog section */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sessions, topics, or creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11 pr-4 h-12 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" /> Loading...</span>
            ) : (
              <span><span className="font-semibold text-gray-800">{totalCount}</span> session{totalCount !== 1 ? 's' : ''} {debouncedSearch ? `for "${debouncedSearch}"` : ''}</span>
            )}
          </p>
          {user?.role === 'creator' && (
            <Link href="/creator" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </Link>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-gray-500">{error}</p>
            <button onClick={fetchSessions} className="mt-4 btn-secondary text-sm">Try again</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No sessions found</h3>
            <p className="text-gray-400 text-sm mb-6">Try a different search term or browse all categories</p>
            <button onClick={() => { setSearch(''); setCategory('all') }} className="btn-secondary text-sm">
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === p ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
