import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Sessions<span className="text-primary-600">.</span></span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Catalog</Link>
            <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
          </div>

          {/* Copy */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Sessions Marketplace
          </p>
        </div>
      </div>
    </footer>
  )
}
