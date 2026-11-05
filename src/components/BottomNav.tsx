
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Find', icon: Search, href: '/search' },
  { label: 'Post', icon: PlusSquare, href: '/owner/new', sublabel: 'Free' },
  { label: 'Saved', icon: Heart, href: '/saved' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 50) {
        setIsVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  if (pathname === '/login') return null

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-border h-16 px-4 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-out",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex items-center justify-between h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors relative",
                isActive ? "text-brand-text-primary" : "text-brand-text-secondary"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "fill-brand-teal text-brand-teal")} />
                {item.sublabel && (
                  <span className="absolute -top-2 -right-3 bg-brand-teal text-white text-[8px] px-1 py-0.5 rounded-[4px] font-bold uppercase leading-none shadow-sm">
                    {item.sublabel}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                isActive ? "text-brand-text-primary" : "text-brand-text-secondary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-brand-teal rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
