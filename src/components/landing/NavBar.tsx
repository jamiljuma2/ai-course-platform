'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur border-b border-dark-700' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="font-bold text-white">AI for Beginners</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#modules" className="text-sm text-dark-300 hover:text-white transition-colors">Modules</a>
          <a href="#pricing" className="text-sm text-dark-300 hover:text-white transition-colors">Pricing</a>
          {!loading && user && (
            <Link href="/dashboard" className="text-sm text-dark-300 hover:text-white transition-colors">Dashboard</Link>
          )}
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-dark-300 truncate max-w-[100px]">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-dark-300 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-dark-300 hover:text-white transition-colors">Sign In</Link>
                  <a href="#enroll" className="btn-primary py-2 px-5 text-sm">Enroll Now</a>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-4 space-y-4">
          <a href="#modules" onClick={() => setOpen(false)} className="block text-dark-300 hover:text-white">Modules</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block text-dark-300 hover:text-white">Pricing</a>
          {!loading && user && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-dark-300 hover:text-white">Dashboard</Link>
          )}
          
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-dark-300">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                    className="w-full text-left text-dark-300 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block text-dark-300 hover:text-white">Sign In</Link>
                  <a href="#enroll" onClick={() => setOpen(false)} className="btn-primary w-full text-center">Enroll Now</a>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  )
}
