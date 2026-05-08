import Link from 'next/link'
import { format } from 'date-fns'
import type { Session } from '@/types'
import Badge from '@/components/ui/Badge'

const CATEGORY_COLOR: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = {
  tech: 'blue', coaching: 'green', tutoring: 'purple',
  fitness: 'yellow', wellness: 'green', business: 'blue',
  music: 'purple', art: 'yellow', other: 'gray',
}

export default function SessionCard({ session }: { session: Session }) {
  const spotsLeft = session.max_participants - session.current_participants
  const isFull = spotsLeft <= 0

  return (
    <Link href={`/sessions/${session.id}`} className="card hover:shadow-md transition-shadow group block">
      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-blue-200 relative overflow-hidden">
        {session.image ? (
          <img src={session.image} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge label={session.category} color={CATEGORY_COLOR[session.category] ?? 'gray'} />
        </div>
        {isFull && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Fully Booked</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {session.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{session.description}</p>

        {/* Creator */}
        <div className="flex items-center gap-2 mt-3">
          {session.creator.avatar ? (
            <img src={session.creator.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
              {session.creator.username[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500">
            {session.creator.first_name || session.creator.username}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="font-bold text-lg text-gray-900">
            ${Number(session.price).toFixed(2)}
          </span>
          <div className="text-right">
            <div className="text-xs text-gray-400">
              {format(new Date(session.scheduled_at), 'MMM d, h:mm a')}
            </div>
            <div className="text-xs text-gray-400">
              {session.duration_minutes} min · {isFull ? (
                <span className="text-red-500">Full</span>
              ) : (
                <span className="text-green-600">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
