"use client"

import { useEffect } from "react"
import { X, TrendingUp, CreditCard, Banknote, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SaleItem {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface Sale {
  id: string
  created_at: string
  items: SaleItem[]
  total: number
  payment_method: string
  status: string
}

interface SalesHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  sales: Sale[]
}

export function SalesHistoryModal({ isOpen, onClose, sales }: SalesHistoryModalProps) {
  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const cashRevenue = sales.filter(s => s.payment_method === "efectivo").reduce((sum, s) => sum + Number(s.total), 0)
  const transRevenue = sales.filter(s => s.payment_method === "transferencia").reduce((sum, s) => sum + Number(s.total), 0)

  const getStatusBadge = (status: string) => {
    if (status === "pendiente") return { label: "Pendiente", cls: "bg-amber-100 text-amber-700 border border-amber-200" }
    if (status === "entregado") return { label: "Entregado ✓", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" }
    return { label: status, cls: "bg-zinc-100 text-zinc-600" }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* ─── HEADER FIJO ─── */}
        <div className="flex-shrink-0 bg-white border-b border-zinc-100 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl">Historial del Día</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{sales.length} {sales.length === 1 ? "venta registrada" : "ventas registradas"}</p>
            </div>
            {/* X FIJA – fuera del scroll */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          {/* Métricas rápidas en el header */}
          {sales.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-emerald-50 rounded-2xl px-3 py-2.5 text-center border border-emerald-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">Total</p>
                <p className="font-black text-emerald-700 text-base">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl px-3 py-2.5 text-center border border-zinc-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5 flex items-center justify-center gap-1"><Banknote className="w-3 h-3" />Efectivo</p>
                <p className="font-black text-zinc-700 text-base">${cashRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 rounded-2xl px-3 py-2.5 text-center border border-blue-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-0.5 flex items-center justify-center gap-1"><CreditCard className="w-3 h-3" />Transfer.</p>
                <p className="font-black text-blue-700 text-base">${transRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── CONTENIDO CON SCROLL ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
              <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No hay ventas registradas hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale, idx) => {
                const status = getStatusBadge(sale.status)
                return (
                  <div key={sale.id} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    {/* Row superior */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-zinc-400 bg-zinc-100 rounded-lg px-2 py-1">
                          #{String(sales.length - idx).padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(sale.created_at)}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-zinc-900 text-lg leading-none">${Number(sale.total).toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {sale.payment_method === "efectivo" ? "💵 Efectivo" : "💳 Transferencia"}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      {(sale.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-700">
                            <span className="font-bold text-zinc-900 mr-1.5">{item.quantity}×</span>
                            {item.name}
                          </span>
                          <span className="font-semibold text-zinc-700 ml-2 flex-shrink-0">
                            ${Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── FOOTER FIJO ─── */}
        <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
          <Button
            onClick={onClose}
            className="w-full rounded-2xl h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
