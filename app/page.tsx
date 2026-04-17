import Link from "next/link"
import { IceCream2, ShoppingBag, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 font-sans selection:bg-zinc-200 relative overflow-hidden">
      
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-zinc-50 to-zinc-50 pointer-events-none" />

      <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-24 max-w-3xl">
          <div className="flex justify-center mb-8">
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-xl">
              <IceCream2 className="w-12 h-12 text-zinc-800" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 mb-6 text-balance">
            Ciocolatto
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 font-light max-w-2xl mx-auto text-pretty">
            Gestión integral de alto rendimiento para productos, inventario y ventas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
          {/* Card 1: Productos */}
          <Link href="/register" className="group">
            <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-3xl p-8 h-full transition-all duration-300 hover:bg-white hover:border-zinc-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
              <div className="bg-zinc-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-200 transition-colors">
                <IceCream2 className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">Menú & Inventario</h2>
              <p className="text-zinc-600 text-pretty font-light leading-relaxed">
                Administre el catálogo de productos con precisión. Controle stock, categorías y variantes.
              </p>
            </div>
          </Link>

          {/* Card 2: Ventas */}
          <Link href="/orders" className="group">
            <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-3xl p-8 h-full transition-all duration-300 hover:bg-white hover:border-zinc-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
              <div className="bg-zinc-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">Operaciones</h2>
              <p className="text-zinc-600 text-pretty font-light leading-relaxed">
                Registre y supervise las comandas diarias. Procesamiento ágil y listado de pedidos en curso.
              </p>
            </div>
          </Link>

          {/* Card 3: Estadisticas */}
          <Link href="/statistics" className="group">
            <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-3xl p-8 h-full transition-all duration-300 hover:bg-white hover:border-zinc-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
              <div className="bg-zinc-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">Inteligencia de Negocio</h2>
              <p className="text-zinc-600 text-pretty font-light leading-relaxed">
                Métricas vitales en tiempo real. Analice los productos más vendidos y rendimientos de ingresos.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
