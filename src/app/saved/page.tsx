
"use client"

import Navbar from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold text-brand-text-primary">Shortlist</h1>
          <p className="text-brand-text-secondary text-sm">Review your favorite rental properties across India.</p>
        </div>
        
        <Card className="border-brand-border py-20 text-center shadow-sm bg-white">
          <CardContent className="space-y-6">
            <div className="w-24 h-24 bg-brand-bg-warm rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-brand-text-secondary opacity-20" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-brand-text-primary">No saved properties yet</p>
              <p className="text-brand-text-secondary max-w-xs mx-auto">Click the heart icon on any property to keep it in your shortlist for later viewing.</p>
            </div>
            <Button asChild className="bg-brand-teal hover:bg-brand-teal-mid font-bold shadow-teal h-12 px-8">
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Find a Room
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
