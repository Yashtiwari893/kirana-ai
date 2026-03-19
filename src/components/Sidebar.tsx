'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  MessageSquare,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, badge: 'Live' },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🛒</div>
          <div>
            <div className="logo-text">KiranaAI</div>
            <div className="logo-subtitle">WhatsApp AI Ordering</div>
          </div>
        </div>
      </div>

      {/* WhatsApp Status */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '8px', padding: '0.5rem 0.75rem',
        }}>
          <span className="live-dot"></span>
          <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>
            WhatsApp Bot Active
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><Icon size={18} /></span>
              {item.label}
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          )
        })}

        <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>Reports</div>
        {navItems.slice(5).map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><Icon size={18} /></span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,163,74,0.04) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.15)',
          borderRadius: '10px', padding: '0.875rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Zap size={14} color="#22c55e" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80' }}>Free Plan</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Upgrade for unlimited orders
          </div>
        </div>
      </div>
    </aside>
  )
}
