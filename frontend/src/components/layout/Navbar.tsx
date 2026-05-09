'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, loading, logout, isCreator } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">
              Sessions<span className="text-primary-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            <NavLink href="/landing-page" active={isActive('/landing-page')}>Home</NavLink>
            <NavLink href="/" active={isActive('/')}>Explore</NavLink>
            {!loading && user && (
              <>
                <NavLink href="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
                {isCreator && (
                  <NavLink href="/creator" active={isActive('/creator')}>Creator</NavLink>
                )}
              </>
            )}
          </div>

          {/* Auth area */}
          <div className="hidden sm:flex items-center gap-3">
            {!loading && (
              user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700">{user.first_name || user.username}</span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.email || user.username}</p>
                      </div>
                      <Link href="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary text-sm py-2 px-4">
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-100 pt-3 space-y-1 animate-fade-in">
            <MobileNavLink href="/landing-page" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>Explore</MobileNavLink>
            {user ? (
              <>
                <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
                {isCreator && <MobileNavLink href="/creator" onClick={() => setMenuOpen(false)}>Creator Studio</MobileNavLink>}
                <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>Profile</MobileNavLink>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block">
                <span className="btn-primary w-full text-sm justify-center">Sign in</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}>
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
      {children}
    </Link>
  )
}
