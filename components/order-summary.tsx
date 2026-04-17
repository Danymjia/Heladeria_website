"use client"

import { ShoppingCart, X, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface OrderSummaryProps {
  items: OrderItem[]
  onRemoveItem: (index: number) => void
  onSubmitOrder: (paymentMethod: string) => void
  onShowHistory: () => void
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
}

export function OrderSummary({ items, onRemoveItem, onSubmitOrder, onShowHistory, paymentMethod, onPaymentMethodChange }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-2 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-sky-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Orden Actual</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowHistory}
          className="hover:bg-sky-50 rounded-xl"
        >
          <History className="w-4 h-4 mr-1" />
          Historial
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay productos en la orden</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    <span className="text-pink-600 font-bold mr-1">{item.quantity}</span>
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ${item.price.toFixed(2)} {item.quantity > 1 && `× ${item.quantity}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="hover:bg-red-50 hover:text-red-600 rounded-lg h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total</span>
              <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Método de Pago</Label>
              <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="flex gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Label htmlFor="efectivo" className="cursor-pointer text-sm font-medium">
                    💵 Efectivo
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="cursor-pointer text-sm font-medium">
                    💳 Transferencia
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button
            onClick={() => onSubmitOrder(paymentMethod)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 transition-all hover:scale-105"
          >
            🟢 Orden Lista
          </Button>
        </>
      )}
    </div>
  )
}
