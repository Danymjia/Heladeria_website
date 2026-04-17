"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Package, IceCream2, DollarSign, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Button } from "@/components/ui/button"

const PIE_COLORS = ['#ec4899', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function StatisticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Custom date selection
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [useCustom, setUseCustom] = useState(false)

  // Expanded states for "Ver Más"
  const [expandRevenue, setExpandRevenue] = useState(false)
  const [expandSales, setExpandSales] = useState(false)
  const [expandProduct, setExpandProduct] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      let url = "/api/statistics"
      if (useCustom && customStart && customEnd) {
        url += `?start=${customStart}&end=${customEnd}`
      }
      const res = await fetch(url)
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [useCustom])

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      setUseCustom(true)
    }
  }
  const handleClearCustomDate = () => {
    setCustomStart("")
    setCustomEnd("")
    setUseCustom(false)
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-emerald-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BarChart3Icon className="w-8 h-8 animate-bounce text-emerald-500" />
          <p className="font-medium">Cargando Inteligencia de Negocio...</p>
        </div>
      </div>
    )
  }

  // Si usamos rango customizado, el set principal de datos viene de data.custom, sino de data.today
  const currentSet = (useCustom && data.custom) ? data.custom : data.today

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-6 gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-emerald-600 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Estadísticas & Análisis</h1>
            <p className="text-zinc-500 mt-2">Métricas de rendimiento de tu negocio en tiempo real.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center text-sm text-zinc-600">
              <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
              <span>Rango Personalizado:</span>
            </div>
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm"
            />
            <span className="text-zinc-400">a</span>
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm"
            />
            {useCustom ? (
              <Button onClick={handleClearCustomDate} variant="outline" size="sm" className="rounded-lg text-red-500 border-red-200 bg-red-50 hover:bg-red-100">
                Limpiar
              </Button>
            ) : (
              <Button onClick={handleApplyCustomDate} size="sm" className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white">
                Aplicar
              </Button>
            )}
          </div>
        </header>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ingresos Totales */}
          <div className="bg-white shadow-sm border border-emerald-100 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10" />
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-zinc-600 font-medium tracking-tight">Ingresos Totales {!useCustom && "(Hoy)"}</h3>
            </div>
            <p className="text-4xl font-extrabold text-emerald-700">${currentSet.revenue.toFixed(2)}</p>
            
            {!useCustom && (
              <div className="mt-4 border-t border-zinc-100 pt-3">
                <button 
                  onClick={() => setExpandRevenue(!expandRevenue)}
                  className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-700 transition"
                >
                  {expandRevenue ? <><ChevronUp className="w-4 h-4 mr-1"/> Ocultar comparativa</> : <><ChevronDown className="w-4 h-4 mr-1"/> Ver más (Semana/Mes)</>}
                </button>
                {expandRevenue && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <p className="text-zinc-500 mb-1">Semana</p>
                      <p className="font-bold text-zinc-900">${data.week.revenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <p className="text-zinc-500 mb-1">Mes</p>
                      <p className="font-bold text-zinc-900">${data.month.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Ventas Completadas */}
          <div className="bg-white shadow-sm border border-blue-100 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
              <h3 className="text-zinc-600 font-medium tracking-tight">Ventas Completadas {!useCustom && "(Hoy)"}</h3>
            </div>
            <p className="text-4xl font-extrabold text-blue-700">{currentSet.sales}</p>
            
            {!useCustom && (
              <div className="mt-4 border-t border-zinc-100 pt-3">
                <button 
                  onClick={() => setExpandSales(!expandSales)}
                  className="text-sm font-medium text-blue-600 flex items-center hover:text-blue-700 transition"
                >
                  {expandSales ? <><ChevronUp className="w-4 h-4 mr-1"/> Ocultar comparativa</> : <><ChevronDown className="w-4 h-4 mr-1"/> Ver más (Semana/Mes)</>}
                </button>
                {expandSales && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <p className="text-zinc-500 mb-1">Semana</p>
                      <p className="font-bold text-zinc-900">{data.week.sales} órdenes</p>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <p className="text-zinc-500 mb-1">Mes</p>
                      <p className="font-bold text-zinc-900">{data.month.sales} órdenes</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Producto Estrella */}
          <div className="bg-white shadow-sm border border-orange-100 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-2xl"><Package className="w-6 h-6 text-orange-600" /></div>
              <h3 className="text-zinc-600 font-medium tracking-tight">Producto Estrella {!useCustom && "(Hoy)"}</h3>
            </div>
            <p className="text-2xl font-extrabold text-orange-700 truncate">{currentSet.topProduct}</p>
            
            {!useCustom && (
              <div className="mt-4 border-t border-zinc-100 pt-3">
                <button 
                  onClick={() => setExpandProduct(!expandProduct)}
                  className="text-sm font-medium text-orange-600 flex items-center hover:text-orange-700 transition"
                >
                  {expandProduct ? <><ChevronUp className="w-4 h-4 mr-1"/> Ocultar comparativa</> : <><ChevronDown className="w-4 h-4 mr-1"/> Ver más (Semana/Mes)</>}
                </button>
                {expandProduct && (
                  <div className="mt-3 space-y-2 text-sm animate-in slide-in-from-top-2">
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex justify-between items-center">
                      <span className="text-zinc-500">Semana</span>
                      <span className="font-bold text-zinc-900 truncate max-w-[150px]">{data.week.topProduct}</span>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex justify-between items-center">
                      <span className="text-zinc-500">Mes</span>
                      <span className="font-bold text-zinc-900 truncate max-w-[150px]">{data.month.topProduct}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Bar Chart - Top Products */}
          <div className="bg-white shadow-sm border border-zinc-200 rounded-3xl p-6 lg:p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
              <Package className="w-6 h-6 text-indigo-500" /> TOP Productos Vendidos {useCustom ? "" : "(Mes)"}
            </h3>
            <div className="h-[300px] w-full">
              {currentSet.popularProducts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentSet.popularProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={12} width={120} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="total_quantity" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                    {
                      currentSet.popularProducts.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart - Top Flavors */}
          <div className="bg-white shadow-sm border border-zinc-200 rounded-3xl p-6 lg:p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
              <IceCream2 className="w-6 h-6 text-pink-500" /> TOP Sabores Preferidos {useCustom ? "" : "(Mes)"}
            </h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              {currentSet.popularFlavors.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentSet.popularFlavors}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="times_sold"
                      stroke="none"
                    >
                      {currentSet.popularFlavors.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}  />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {currentSet.popularFlavors.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {currentSet.popularFlavors.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-zinc-700 font-medium bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 shadow-sm">
                    <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

function BarChart3Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}
