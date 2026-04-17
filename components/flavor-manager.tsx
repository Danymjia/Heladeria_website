"use client"

import { Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Flavor {
  id: string
  name: string
  available: boolean
}

interface FlavorManagerProps {
  flavors: Flavor[]
  onToggleAvailability: (id: string, available: boolean) => void
  onDelete: (id: string) => void
}

export function FlavorManager({ flavors, onToggleAvailability, onDelete }: FlavorManagerProps) {

  return (
    <div>
      {/* Flavors List - Responsive grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {flavors.length === 0 ? (
          <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
            <p className="text-sm">No hay sabores registrados</p>
          </div>
        ) : (
          flavors.map((flavor) => (
            <div
              key={flavor.id}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                flavor.available
                  ? "border-gray-200 bg-white hover:shadow-md"
                  : "border-gray-300 bg-gray-50 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-full">
                <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                  <img 
                    src="/bola-de-helado.jpg" 
                    alt={flavor.name}
                    className="w-full h-full object-cover"
                  />
                  {!flavor.available && (
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
                <span className={`font-medium text-xs block truncate ${flavor.available ? "text-gray-800" : "text-gray-500"}`}>
                  {flavor.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-1 w-full justify-center">
                <Button
                  onClick={() => onToggleAvailability(flavor.id, !flavor.available)}
                  variant="outline"
                  size="sm"
                  className="rounded-md h-7 w-7 p-0"
                  title={flavor.available ? "Marcar como no disponible" : "Marcar como disponible"}
                >
                  {flavor.available ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => onDelete(flavor.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 p-0"
                  title="Eliminar sabor"
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
