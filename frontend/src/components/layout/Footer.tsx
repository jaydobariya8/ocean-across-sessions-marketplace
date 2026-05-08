export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Sessions Marketplace. Built with Next.js + Django.
      </div>
    </footer>
  )
}
