import Link from "next/link"
import { IceCreamCone } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm text-zinc-900">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-zinc-900 p-2 rounded-xl">
            <IceCreamCone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Ciocolatto
          </h1>
        </Link>
      </div>
    </header>
  )
}
