import Link from 'next/link'
import { format } from 'date-fns'
import type { Session } from '@/types'

const CATEGORY_GRADIENT: Record<string, string> = {
  tech:      'from-blue-500 to-indigo-600',
  coaching:  'from-emerald-500 to-teal-600',
  tutoring:  'from-violet-500 to-purple-600',
  fitness:   'from-orange-500 to-red-500',
  wellness:  'from-teal-500 to-cyan-600',
  business:  'from-slate-600 to-gray-700',
  music:     'from-pink-500 to-rose-600',
  art:       'from-amber-500 to-orange-600',
  other:     'from-gray-400 to-slate-500',
}

const CATEGORY_BG: Record<string, string> = {
  tech:      'bg-blue-50 text-blue-700',
  coaching:  'bg-emerald-50 text-emerald-700',
  tutoring:  'bg-violet-50 text-violet-700',
  fitness:   'bg-orange-50 text-orange-700',
  wellness:  'bg-teal-50 text-teal-700',
  business:  'bg-slate-100 text-slate-700',
  music:     'bg-pink-50 text-pink-700',
  art:       'bg-amber-50 text-amber-700',
  other:     'bg-gray-100 text-gray-600',
}

export default function SessionCard({ session }: { session: Session }) {
  const spotsLeft = session.max_participants - session.current_participants
  const isFull = spotsLeft <= 0
  const gradient = CATEGORY_GRADIENT[session.category] ?? 'from-primary-500 to-primary-700'
  const catBg = CATEGORY_BG[session.category] ?? 'bg-gray-100 text-gray-600'

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {session.image ? (
          <img
            src={session.image}
            alt={session.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <CategoryIcon category={session.category} />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${catBg} bg-white/90 backdrop-blur-sm`}>
            {session.category}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-900 shadow-sm">
            {Number(session.price) === 0 ? 'Free' : `$${Number(session.price).toFixed(2)}`}
          </span>
        </div>

        {/* Full overlay */}
        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm tracking-wide uppercase bg-black/60 px-4 py-1.5 rounded-full">
              Fully Booked
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors mb-1.5">
          {session.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {session.description}
        </p>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          {session.creator.avatar ? (
            <img src={session.creator.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
              {session.creator.username[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500 font-medium">
            {session.creator.first_name
              ? `${session.creator.first_name} ${session.creator.last_name || ''}`.trim()
              : session.creator.username}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{format(new Date(session.scheduled_at), 'MMM d • h:mm a')}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isFull ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {isFull ? 'Full' : `${spotsLeft} left`}
          </span>
        </div>
      </div>
    </Link>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, JSX.Element> = {
    tech: (
      <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    fitness: (
      <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    music: (
      <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  }
  return icons[category] ?? (
    <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}
