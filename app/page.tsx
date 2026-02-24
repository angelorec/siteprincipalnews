import { Suspense } from "react"
import { MobileProfileSection } from "@/components/mobile-profile-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <MobileProfileSection />
      </Suspense>
    </main>
  )
}
