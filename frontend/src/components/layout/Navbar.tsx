'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export default function Navbar() {
  const { user, loading, logout, isCreator } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            Sessions
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Catalog
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  {isCreator && (
                    <Link href="/creator" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Creator
                    </Link>
                  )}
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Dashboard
                  </Link>

                  {/* Avatar dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 rounded-full focus:outline-none"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.first_name || user.username}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <Link href="/profile" onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/login" className="btn-primary text-sm">
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <button className="sm:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-700">Catalog</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2 text-gray-700">Dashboard</Link>
                {isCreator && <Link href="/creator" className="block py-2 text-gray-700">Creator</Link>}
                <Link href="/profile" className="block py-2 text-gray-700">Profile</Link>
                <button onClick={handleLogout} className="block py-2 text-red-600">Sign out</button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-primary-600 font-medium">Sign in</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
