import { useEffect } from "react"
import { X, CheckCircle2, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PendingOrder {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  items: any[];
}

interface PendingOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  pendingOrders: PendingOrder[]
  onMarkAsDelivered: (id: string) => void
}

export function PendingOrdersModal({ isOpen, onClose, pendingOrders, onMarkAsDelivered }: PendingOrdersModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* ─── HEADER FIJO ─── */}
        <div className="flex-shrink-0 bg-white border-b border-zinc-100 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900 text-xl">Órdenes en Cocina</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {pendingOrders.length === 0
                    ? "Todo listo"
                    : `${pendingOrders.length} ${pendingOrders.length === 1 ? "orden esperando" : "órdenes esperando"}`}
                </p>
              </div>
            </div>
            {/* X FIJA – nunca se mueve */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* ─── CONTENIDO CON SCROLL ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
              <CheckCircle2 className="w-14 h-14 mb-3 text-emerald-300" />
              <p className="text-base font-semibold text-zinc-500">¡Todo entregado!</p>
              <p className="text-sm text-zinc-400 mt-1">No hay órdenes en preparación</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order, idx) => (
                <div key={order.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Row superior */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
                          Orden #{pendingOrders.length - idx}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(order.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-zinc-900 text-xl leading-none">${Number(order.total).toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 capitalize">
                        {order.payment_method === "efectivo" ? "💵 Efectivo" : "💳 Transferencia"}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-zinc-50 rounded-xl p-3 mb-4 space-y-1.5">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-700">
                          <span className="font-bold text-zinc-900 mr-1.5">{item.quantity}×</span>
                          {item.name}
                        </span>
                        <span className="text-zinc-500 flex-shrink-0 ml-2">
                          ${Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Botón entregar */}
                  <Button
                    onClick={() => onMarkAsDelivered(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como entregada
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── FOOTER FIJO ─── */}
        <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-2xl h-12 border-zinc-300 text-zinc-600 hover:bg-zinc-50 font-semibold"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
