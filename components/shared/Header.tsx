'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Nav Panel */}
      <nav
        className={`fixed top-0 right-0 w-80 h-screen z-50 bg-bg2 border-l border-border2 flex flex-col transition-transform duration-300 md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 font-condensed text-lg font-bold uppercase tracking-wider">
            <span className="text-primary">●</span>
            Anime Online
          </div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded bg-bg3 border border-border2 flex items-center justify-center text-muted hover:bg-red-500 hover:border-red-500 hover:text-white transition"
          >
            <i className="fas fa-xmark text-sm" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3.5 overflow-y-auto flex-1">
          <NavItem href="/" icon="house" label="Inicio" onClick={closeMenu} />
          <NavItem href="/directorio" icon="list" label="Directorio" onClick={closeMenu} badge="A-Z" badgeType="blue" />
          <NavItem href="/buscar" icon="magnifying-glass" label="Búsqueda" onClick={closeMenu} />
          <NavItem href="/temporada" icon="calendar-days" label="Temporada" onClick={closeMenu} badge="HOY" badgeType="red" />
        </div>
      </nav>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-13 px-4.5 bg-black/97 backdrop-blur-md border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-condensed text-xl font-black uppercase tracking-widest text-white hover:opacity-90 transition">
          <span className="text-primary">
            <i className="fas fa-circle-play" />
          </span>
          Anime Online
        </Link>

        <button
          onClick={toggleMenu}
          className="w-9 h-9 rounded border border-border2 bg-bg3 flex items-center justify-center text-muted hover:bg-bg2 hover:border-border transition"
        >
          <i className="fas fa-bars text-sm" />
        </button>
      </header>

      {/* Desktop Nav */}
      <div className="hidden md:flex sticky top-13 z-20 w-full bg-bg2 border-b border-border px-4 py-2">
        <div className="max-w-6xl mx-auto w-full flex gap-4">
          <Link href="/" className="px-4 py-2 text-sm font-semibold uppercase text-text hover:text-primary transition">
            Inicio
          </Link>
          <Link href="/directorio" className="px-4 py-2 text-sm font-semibold uppercase text-text hover:text-primary transition">
            Directorio
          </Link>
          <Link href="/buscar" className="px-4 py-2 text-sm font-semibold uppercase text-text hover:text-primary transition">
            Búsqueda
          </Link>
          <Link href="/temporada" className="px-4 py-2 text-sm font-semibold uppercase text-text hover:text-primary transition">
            Temporada
          </Link>
        </div>
      </div>
    </>
  )
}

interface NavItemProps {
  href: string
  icon: string
  label: string
  onClick?: () => void
  badge?: string
  badgeType?: 'blue' | 'red'
}

function NavItem({ href, icon, label, onClick, badge, badgeType }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between p-3.5 rounded bg-bg3 border border-border2 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-dark/10 transition group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-gradient-primary group-hover:border-transparent group-hover:text-white transition">
          <i className={`fas fa-${icon} text-sm`} />
        </div>
        <span className="font-condensed text-sm font-bold uppercase tracking-wider text-text">
          {label}
        </span>
      </div>
      {badge && (
        <span
          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
            badgeType === 'blue'
              ? 'bg-primary/15 border border-primary/30 text-primary'
              : 'bg-error/15 border border-error/30 text-error'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
