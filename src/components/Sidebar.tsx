'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  LayoutDashboard, ShoppingCart, Package,
  Users, Megaphone, BarChart3, Settings, Zap, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',            label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/orders',     label: 'Orders',     icon: ShoppingCart,  badge: 'Live' },
  { href: '/dashboard/products',   label: 'Products',   icon: Package },
  { href: '/dashboard/customers',  label: 'Customers',  icon: Users },
  { href: '/dashboard/broadcast',  label: 'Broadcast',  icon: Megaphone },
  { href: '/dashboard/analytics',  label: 'Analytics',  icon: BarChart3 },
]

const bottomNav = [
  { href: '/dashboard/settings',   label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const renderNavItem = (item: typeof navItems[0]) => {
    const Icon = item.icon
    const active = isActive(item.href)
    return (
      <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
        <span className="nav-icon"><Icon size={17} /></span>
        {item.label}
        {item.badge && <span className="nav-badge">{item.badge}</span>}
      </Link>
    )
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">🏪</div>
          <div>
            <div className="sidebar-logo-name">Kirana<span>AI</span></div>
            <div className="sidebar-logo-sub">WhatsApp AI Platform</div>
          </div>
        </div>
      </div>

      {/* Bot Status */}
      <div className="sidebar-status">
        <div className="status-pill">
          <span className="status-dot" />
          <span className="status-text">WhatsApp Bot Active</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section">Main</div>
        {navItems.map(renderNavItem)}

        <div className="nav-section" style={{ marginTop: '8px' }}>Manage</div>
        {bottomNav.map(renderNavItem)}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Upgrade Card */}
        <div className="upgrade-card" style={{ marginBottom: '10px' }}>
          <div className="upgrade-title"><Zap size={12} /> Free Plan</div>
          <div className="upgrade-sub">Upgrade for unlimited orders & analytics</div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
