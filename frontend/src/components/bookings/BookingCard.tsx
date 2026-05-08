'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import Badge from '@/components/ui/Badge'
import type { Booking } from '@/types'

const STATUS_COLOR = {
  pending: 'yellow', confirmed: 'green',
  cancelled: 'gray', completed: 'blue',
} as const

interface Props {
  booking: Booking
  onCancelled: (id: number) => void
}

export default function BookingCard({ booking, onCancelled }: Props) {
  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    try {
      await api.patch(`/bookings/${booking.id}/`, { status: 'cancelled' })
      toast.success('Booking cancelled.')
      onCancelled(booking.id)
    } catch {
      toast.error('Failed to cancel.')
    }
  }

  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-4">
      {/* Session image thumb */}
      <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-blue-200 flex-shrink-0">
        {booking.session.image ? (
          <img src={booking.session.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Link href={`/sessions/${booking.session.id}`}
            className="font-semibold text-gray-900 hover:text-primary-600 truncate">
            {booking.session.title}
          </Link>
          <Badge label={booking.status} color={STATUS_COLOR[booking.status]} />
        </div>

        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(booking.session.scheduled_at), 'PPP • p')} · {booking.session.duration_minutes} min
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          Booked {format(new Date(booking.booked_at), 'MMM d, yyyy')} ·{' '}
          <span className="font-medium text-gray-700">${Number(booking.amount_paid).toFixed(2)}</span>
        </p>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="flex-shrink-0">
          <button onClick={handleCancel}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
