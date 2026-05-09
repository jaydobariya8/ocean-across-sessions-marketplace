'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import CheckoutModal from '@/components/bookings/CheckoutModal'
import type { Session, Booking } from '@/types'

const CATEGORY_COLOR: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = {
  tech: 'blue', coaching: 'green', tutoring: 'purple',
  fitness: 'yellow', wellness: 'green', business: 'blue',
  music: 'purple', art: 'yellow', other: 'gray',
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [alreadyBooked, setAlreadyBooked] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Session>(`/sessions/${id}/`)
      .then(({ data }) => setSession(data))
      .catch(() => setError('Session not found.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !session) return
    api.get('/bookings/?page_size=100')
      .then(({ data }) => {
        const found = data.results.find(
          (b: Booking) => b.session.id === session.id && b.status !== 'cancelled'
        )
        setAlreadyBooked(!!found)
      })
      .catch(() => {})
  }, [user, session])

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setBooking(true)
    try {
      const { data } = await api.post('/bookings/', { session_id: session!.id })
      // Free session → confirmed immediately; paid → open Stripe checkout
      if (Number(session!.price) === 0) {
        setAlreadyBooked(true)
        toast.success('Session booked!')
      } else {
        setPendingBookingId(data.id)
        setCheckoutOpen(true)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.non_field_errors?.[0] || err?.response?.data?.detail || 'Booking failed.'
      toast.error(msg)
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg">{error || 'Session not found.'}</p>
        <Link href="/" className="text-primary-600 text-sm mt-4 block hover:underline">← Back to catalog</Link>
      </div>
    )
  }

  const spotsLeft = session.max_participants - session.current_participants
  const isFull = spotsLeft <= 0
  const isOwner = user?.id === session.creator.id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-blue-200">
            {session.image ? (
              <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title + category */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge label={session.category} color={CATEGORY_COLOR[session.category] ?? 'gray'} />
              {session.status === 'cancelled' && <Badge label="Cancelled" color="red" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            {session.creator.avatar ? (
              <img src={session.creator.avatar} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-bold">
                {session.creator.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Hosted by</p>
              <p className="font-semibold text-gray-900">
                {session.creator.first_name && session.creator.last_name
                  ? `${session.creator.first_name} ${session.creator.last_name}`
                  : session.creator.username}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About this session</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{session.description}</p>
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${Number(session.price).toFixed(2)}
            </div>
            <p className="text-sm text-gray-400 mb-6">per person</p>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <DetailRow icon="calendar" label="Date & Time"
                value={format(new Date(session.scheduled_at), 'PPP • p')} />
              <DetailRow icon="clock" label="Duration" value={`${session.duration_minutes} minutes`} />
              <DetailRow icon="users" label="Availability"
                value={isFull ? 'Fully booked' : `${spotsLeft} of ${session.max_participants} spots left`}
                valueClass={isFull ? 'text-red-500' : 'text-green-600'} />
            </div>

            {/* Book button */}
            {isOwner ? (
              <Link href={`/creator`} className="btn-secondary w-full text-center block">
                Manage Session
              </Link>
            ) : alreadyBooked ? (
              <div className="w-full py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <span className="text-green-700 font-medium text-sm">✓ You&apos;ve booked this session</span>
              </div>
            ) : session.status === 'cancelled' ? (
              <div className="w-full py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <span className="text-red-600 font-medium text-sm">Session cancelled</span>
              </div>
            ) : (
              <button
                onClick={handleBook}
                disabled={isFull || booking}
                className="btn-primary w-full"
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" /> Booking...
                  </span>
                ) : isFull ? 'Fully Booked' : !isAuthenticated ? 'Sign in to Book' : 'Book Now'}
              </button>
            )}

            {!isAuthenticated && !isFull && session.status !== 'cancelled' && (
              <p className="text-xs text-gray-400 text-center mt-3">
                <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link> to book this session
              </p>
            )}
          </div>
        </div>
      </div>

      {session && pendingBookingId && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={async () => {
            setCheckoutOpen(false)
            // only cancel if payment was not completed (paidRef tracked inside modal)
            if (pendingBookingId && !alreadyBooked) {
              try {
                await api.patch(`/bookings/${pendingBookingId}/`, { status: 'cancelled' })
              } catch {}
              setPendingBookingId(null)
            }
          }}
          session={session}
          bookingId={pendingBookingId}
          onPaid={() => {
            setAlreadyBooked(true)
            setPendingBookingId(null)
          }}
        />
      )}
    </div>
  )
}

function DetailRow({
  icon, label, value, valueClass = 'text-gray-700'
}: {
  icon: string; label: string; value: string; valueClass?: string
}) {
  const icons: Record<string, JSX.Element> = {
    calendar: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icons[icon]}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
