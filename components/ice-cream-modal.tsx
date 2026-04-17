"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Product {
  id: string
  name: string
  type: string
  price: number
  stock: number
}

interface Flavor {
  id: string
  name: string
  available: boolean
}

interface IceCreamModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onConfirm: (flavors: string[], withCheese: boolean) => void
}

const CHEESE_PRICE = 0.70 // Precio del queso

export function IceCreamModal({ isOpen, onClose, product, onConfirm }: IceCreamModalProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [withCheese, setWithCheese] = useState(false)
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([])

  // Fetch flavors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFlavors()
    }
  }, [isOpen])

  const fetchFlavors = async () => {
    try {
      const response = await fetch("/api/flavors")
      if (response.ok) {
        const data = await response.json()
        // Only show available flavors
        setAvailableFlavors(data.filter((f: Flavor) => f.available))
      }
    } catch (error) {
      console.error("Error fetching flavors:", error)
    }
  }

  const toggleFlavor = (flavorName: string) => {
    if (selectedFlavors.includes(flavorName)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavorName))
    } else {
      setSelectedFlavors([...selectedFlavors, flavorName])
    }
  }

  if (!product) return null

  const handleConfirm = () => {
    if (selectedFlavors.length === 0) {
      return // Requiere seleccionar al menos un sabor
    }
    onConfirm(selectedFlavors, withCheese)
    setSelectedFlavors([])
    setWithCheese(false)
  }

  const handleClose = () => {
    setSelectedFlavors([])
    setWithCheese(false)
    onClose()
  }

  const calculateTotal = () => {
    let total = product.price
    if (withCheese) {
      total += CHEESE_PRICE
    }
    return total
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Selección de Sabores */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Selecciona los sabores: <span className="text-sm font-normal text-gray-500">(puedes elegir varios)</span>
            </Label>
            {availableFlavors.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <p className="text-sm">No hay sabores disponibles</p>
                <p className="text-xs mt-1">Agrega sabores en la sección de Registro</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableFlavors.map((flavor) => (
                  <div 
                    key={flavor.id} 
                    className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedFlavors.includes(flavor.name)
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => toggleFlavor(flavor.name)}
                  >
                    <Checkbox
                      id={flavor.id}
                      checked={selectedFlavors.includes(flavor.name)}
                      onCheckedChange={() => toggleFlavor(flavor.name)}
                    />
                    <Label htmlFor={flavor.id} className="cursor-pointer text-gray-700 font-normal flex-1">
                      {flavor.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opción de Queso */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="withCheese"
                  checked={withCheese}
                  onCheckedChange={(checked) => setWithCheese(checked as boolean)}
                />
                <Label htmlFor="withCheese" className="cursor-pointer text-gray-700 font-medium">
                  Agregar queso
                </Label>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                +${CHEESE_PRICE.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-pink-600">
                ${calculateTotal().toFixed(2)}
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
                disabled={selectedFlavors.length === 0}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
