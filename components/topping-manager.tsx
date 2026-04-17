"use client"

import { Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Topping {
  id: string
  name: string
  available: boolean
}

interface ToppingManagerProps {
  toppings: Topping[]
  onToggleAvailability: (id: string, available: boolean) => void
  onDelete: (id: string) => void
}

export function ToppingManager({ toppings, onToggleAvailability, onDelete }: ToppingManagerProps) {

  return (
    <div>
      {/* Toppings List - Responsive grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {toppings.length === 0 ? (
          <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
            <p className="text-sm">No hay toppings registrados</p>
          </div>
        ) : (
          toppings.map((topping) => (
            <div
              key={topping.id}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                topping.available
                  ? "border-gray-200 bg-white hover:shadow-md"
                  : "border-gray-300 bg-gray-50 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-full">
                <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                  <img 
                    src="/crema.jpg" 
                    alt={topping.name}
                    className="w-full h-full object-cover"
                  />
                  {!topping.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold rotate-[-12deg] bg-red-600/90 text-white px-2 py-1 rounded leading-none shadow-md">
                        NO DISPONIBLE
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="w-full text-center">
                <span className={`font-medium text-xs block truncate ${topping.available ? "text-gray-800" : "text-gray-500"}`}>
                  {topping.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-1 w-full justify-center">
                <Button
                  onClick={() => onToggleAvailability(topping.id, !topping.available)}
                  variant="outline"
                  size="sm"
                  className="rounded-md h-7 w-7 p-0"
                  title={topping.available ? "Marcar como no disponible" : "Marcar como disponible"}
                >
                  {topping.available ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => onDelete(topping.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 p-0"
                  title="Eliminar topping"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
