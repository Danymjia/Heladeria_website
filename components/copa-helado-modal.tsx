"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Product {
  id: string
  name: string
  type: string
  price: number
  stock: number
}

interface CopaHeladoModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onConfirm: (numSabores: number, finalPrice: number) => void
}

const PRICES = {
  1: 1.60,
  2: 2.10,
  3: 2.60,
}

export function CopaHeladoModal({ isOpen, onClose, product, onConfirm }: CopaHeladoModalProps) {
  const [numSabores, setNumSabores] = useState<number>(1)

  if (!product) return null

  const handleConfirm = () => {
    onConfirm(numSabores, PRICES[numSabores as keyof typeof PRICES])
    setNumSabores(1)
  }

  const handleClose = () => {
    setNumSabores(1)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Copa de Helado con Crema
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              ¿Cuántos sabores deseas?
            </Label>
            <RadioGroup value={numSabores.toString()} onValueChange={(v) => setNumSabores(Number(v))}>
              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      numSabores === num
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setNumSabores(num)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={num.toString()} id={`sabor-${num}`} />
                      <Label htmlFor={`sabor-${num}`} className="cursor-pointer text-gray-700 font-medium">
                        {num} {num === 1 ? 'Sabor' : 'Sabores'}
                      </Label>
                    </div>
                    <span className="text-lg font-bold text-pink-600">
                      ${PRICES[num as keyof typeof PRICES].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-pink-600">
                ${PRICES[numSabores as keyof typeof PRICES].toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl"
              >
                Agregar a la Orden
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
