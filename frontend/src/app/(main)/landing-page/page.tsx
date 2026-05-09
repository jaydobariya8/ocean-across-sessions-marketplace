'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const CATEGORIES = [
  { emoji: '💻', label: 'Tech & Dev',     desc: 'Coding, cloud, AI',     color: 'from-blue-500 to-indigo-600',    bg: 'bg-blue-50',   text: 'text-blue-700' },
  { emoji: '🎯', label: 'Coaching',        desc: 'Life & career growth',  color: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { emoji: '💪', label: 'Fitness',         desc: 'Yoga, HIIT, wellness',  color: 'from-orange-500 to-red-500',    bg: 'bg-orange-50',  text: 'text-orange-700' },
  { emoji: '📚', label: 'Tutoring',        desc: 'Academic support',      color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50',  text: 'text-violet-700' },
  { emoji: '🎵', label: 'Music',           desc: 'Piano, guitar, vocals',  color: 'from-pink-500 to-rose-600',    bg: 'bg-pink-50',    text: 'text-pink-700' },
  { emoji: '📈', label: 'Business',        desc: 'Strategy, finance',     color: 'from-slate-600 to-gray-700',    bg: 'bg-slate-50',   text: 'text-slate-700' },
]

const STEPS = [
  { step: '01', icon: '🔍', title: 'Browse Sessions', desc: 'Explore hundreds of expert-led sessions across tech, coaching, fitness, music, and more.' },
  { step: '02', icon: '📅', title: 'Book Your Spot',  desc: 'Reserve instantly with secure Stripe payments. Get confirmed in seconds.' },
  { step: '03', icon: '🚀', title: 'Start Learning',  desc: 'Join your session, grow your skills, and track everything in your personal dashboard.' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.',  role: 'Software Engineer',   text: 'Booked a Python tutoring session and went from beginner to writing real APIs in 2 weeks. The booking flow is seamless.',      avatar: 'S', color: 'from-blue-500 to-indigo-600' },
  { name: 'James K.',  role: 'Fitness Enthusiast',  text: 'My HIIT coach on this platform is incredible. Flexible scheduling and I can see all my upcoming sessions in one place.',   avatar: 'J', color: 'from-orange-500 to-red-500' },
  { name: 'Priya T.',  role: 'Marketing Manager',   text: 'Found an amazing business strategy coach who helped me land a promotion. Worth every penny.',                              avatar: 'P', color: 'from-violet-500 to-purple-600' },
]

const STATS = [
  { value: '500+', label: 'Live Sessions' },
  { value: '120+', label: 'Expert Creators' },
  { value: '2,000+', label: 'Happy Learners' },
  { value: '4.9★', label: 'Average Rating' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const ctaHref = user ? '/' : '/login'
  const ctaLabel = user ? 'Browse Sessions' : 'Get Started Free'

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-slate-900 via-primary-950 to-violet-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-violet-600/30 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/3 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-primary-200 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Sessions Marketplace is live
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              Learn from<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-violet-400 to-pink-400">
                  the best.
                </span>
              </span><br />
              <span className="text-white">Book in seconds.</span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-lg">
              Connect with expert creators for live 1-on-1 sessions in tech, coaching, fitness, music, and more. Secure payments. Instant confirmation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href={ctaHref}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-400 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary-900/40 transition-all duration-200 text-base hover:-translate-y-0.5">
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Catalog
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No subscription
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Stripe secured
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                OAuth login
              </span>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hidden lg:flex items-center justify-center relative h-[500px]">
            {/* Center card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-72 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-2xl">💻</div>
                <div>
                  <p className="text-white font-bold text-sm">Advanced React Patterns</p>
                  <p className="text-slate-400 text-xs">with Alex Chen</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>⏱ 60 min</span>
                <span>👥 3 of 5 spots</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">$49.00</span>
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">Book Now</span>
              </div>
            </div>

            {/* Top-left floating */}
            <div className="absolute top-8 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg">🎯</div>
                <div>
                  <p className="text-white font-semibold text-xs">Career Coaching</p>
                  <p className="text-slate-400 text-xs">Sarah K.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">$35.00</span>
                <span className="text-emerald-400 font-semibold">✓ 2 spots left</span>
              </div>
            </div>

            {/* Bottom-right floating */}
            <div className="absolute bottom-16 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-lg">💪</div>
                <div>
                  <p className="text-white font-semibold text-xs">HIIT Masterclass</p>
                  <p className="text-slate-400 text-xs">Mike T.</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">$25.00</span>
                <span className="text-emerald-400 font-semibold">✓ 4 spots left</span>
              </div>
            </div>

            {/* Booking confirmed badge */}
            <div className="absolute top-28 right-4 bg-emerald-500 text-white rounded-2xl px-4 py-3 shadow-xl text-xs font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Booking Confirmed!
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600 mb-1">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">What we offer</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Sessions for every goal
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From coding to fitness to music — find an expert who matches exactly what you want to learn.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {CATEGORIES.map(({ emoji, label, desc, color, bg, text }) => (
              <Link href={`/?category=${label.toLowerCase().split(' ')[0]}`} key={label}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl ${bg} border border-transparent hover:border-current hover:shadow-md transition-all duration-200 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                  {emoji}
                </div>
                <p className={`font-bold text-sm ${text} mb-0.5`}>{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="btn-secondary text-sm">
              View all sessions →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Simple process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 text-lg">Get from zero to booked in under 60 seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-violet-300 to-primary-200" />

            {STEPS.map(({ step, icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg shadow-primary-200 relative z-10">
                    {icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-primary-200 text-primary-600 rounded-full text-xs font-black flex items-center justify-center z-20">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href={ctaHref} className="btn-primary text-base px-8 py-3.5">
              {ctaLabel} →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CREATOR CTA ─────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 rounded-3xl p-12 lg:p-16">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full translate-y-16 -translate-x-16" />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-primary-200 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
                  🎬 For Creators
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                  Share your expertise.<br />Earn on your terms.
                </h2>
                <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                  Publish sessions, set your price, and grow your audience. Your Creator Studio gives you full control — sessions, bookings, revenue, all in one dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={user ? '/creator' : '/login'}
                    className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-primary-50 transition-all duration-200 shadow-lg text-sm">
                    {user?.role === 'creator' ? 'Open Creator Studio' : 'Become a Creator'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link href="/"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-all duration-200 text-sm">
                    See creator sessions
                  </Link>
                </div>
              </div>

              {/* Creator perks */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '💰', title: 'Set Your Price',   desc: 'Free or paid — you decide what sessions are worth.' },
                  { icon: '📊', title: 'Revenue Dashboard', desc: 'Track bookings and earnings in real-time.' },
                  { icon: '🌍', title: 'Global Reach',      desc: 'Students from anywhere book your sessions.' },
                  { icon: '⚡', title: 'Instant Payout',    desc: 'Stripe handles payments automatically.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="text-2xl mb-2">{icon}</div>
                    <p className="text-white font-bold text-sm mb-1">{title}</p>
                    <p className="text-primary-200 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Social proof</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Learners love it</h2>
            <p className="text-gray-500 text-lg">Real stories from people who levelled up.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, avatar, color }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-600 rounded-3xl mb-6 shadow-lg shadow-primary-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Your next session<br />is one click away.
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of learners and creators. No subscription required — just find a session you love and book it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ctaHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all duration-200 hover:-translate-y-0.5 text-base">
              {ctaLabel}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/"
              className="text-gray-500 hover:text-gray-700 font-semibold text-sm flex items-center gap-1.5 transition-colors">
              Browse without signing in →
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            Free to join · Sign in with GitHub or Google · Stripe-secured payments
          </p>
        </div>
      </section>

    </div>
  )
}
