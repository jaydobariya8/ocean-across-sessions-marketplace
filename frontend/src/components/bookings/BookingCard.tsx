'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import type { Booking } from '@/types'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: 'Confirmed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500 border border-gray-200' },
  completed: { label: 'Completed', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
} as const

interface Props {
  booking: Booking
  onCancelled: (id: number) => void
}

export default function BookingCard({ booking, onCancelled }: Props) {
  const canCancel = ['pending', 'confirmed'].includes(booking.status)
  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending

  const handleCancel = async () => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return
    try {
      await api.patch(`/bookings/${booking.id}/`, { status: 'cancelled' })
      toast.success('Booking cancelled.')
      onCancelled(booking.id)
    } catch {
      toast.error('Failed to cancel.')
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      <div className="flex gap-0">
        {/* Left color bar */}
        <div className={`w-1 flex-shrink-0 ${
          booking.status === 'confirmed' ? 'bg-emerald-400' :
          booking.status === 'pending'   ? 'bg-amber-400' :
          booking.status === 'cancelled' ? 'bg-gray-300' : 'bg-blue-400'
        }`} />

        <div className="flex flex-col sm:flex-row gap-4 p-5 flex-1 min-w-0">
          {/* Session image */}
          <div className="w-full sm:w-20 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-violet-100 flex-shrink-0">
            {booking.session.image ? (
              <img src={booking.session.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-7 h-7 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
              <Link href={`/sessions/${booking.session.id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm truncate">
                {booking.session.title}
              </Link>
              <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.classes}`}>
                {config.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(booking.session.scheduled_at), 'MMM d, yyyy • h:mm a')}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {booking.session.duration_minutes} min
              </span>
              <span className="font-semibold text-gray-600">${Number(booking.amount_paid).toFixed(2)}</span>
            </div>

            <p className="text-xs text-gray-300 mt-1">
              Booked {format(new Date(booking.booked_at), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Cancel */}
          {canCancel && (
            <div className="flex-shrink-0 self-center">
              <button onClick={handleCancel}
                className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
