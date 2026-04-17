"use client"

import { Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BubbleOption {
  id: string
  name: string
  type: 'base' | 'perla'
  available: boolean
}

interface BubbleManagerProps {
  options: BubbleOption[]
  onToggleAvailability: (id: string, available: boolean) => void
  onDelete: (id: string) => void
}

export function BubbleManager({ options, onToggleAvailability, onDelete }: BubbleManagerProps) {

  const bases = options.filter(opt => opt.type === 'base')
  const perlas = options.filter(opt => opt.type === 'perla')

  return (
    <div>
      {/* Bases Section */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Bases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2">
          {bases.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
              No hay bases registradas
            </div>
          ) : (
            bases.map((option) => (
              <div
                key={option.id}
                className={`flex sm:flex-col items-center sm:items-start gap-2 p-2 sm:p-3 rounded-lg border transition-all ${
                  option.available
                    ? "border-gray-200 bg-white hover:shadow-md"
                    : "border-gray-300 bg-gray-50 opacity-60"
                }`}
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🧃</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex sm:flex-col justify-between sm:justify-start gap-2 sm:gap-1">
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium text-xs sm:text-sm block truncate ${option.available ? "text-gray-800" : "text-gray-500"}`}>
                      {option.name}
                    </span>
                    {!option.available && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full inline-block mt-1">
                        No disponible
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-row gap-1 flex-shrink-0">
                    <Button
                      onClick={() => onToggleAvailability(option.id, !option.available)}
                      variant="outline"
                      size="sm"
                      className="rounded-md h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title={option.available ? "Marcar como no disponible" : "Marcar como disponible"}
                    >
                      {option.available ? (
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => onDelete(option.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title="Eliminar base"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Perlas Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Perlas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2">
          {perlas.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
              No hay perlas registradas
            </div>
          ) : (
            perlas.map((option) => (
              <div
                key={option.id}
                className={`flex sm:flex-col items-center sm:items-start gap-2 p-2 sm:p-3 rounded-lg border transition-all ${
                  option.available
                    ? "border-gray-200 bg-white hover:shadow-md"
                    : "border-gray-300 bg-gray-50 opacity-60"
                }`}
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">⚫</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex sm:flex-col justify-between sm:justify-start gap-2 sm:gap-1">
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium text-xs sm:text-sm block truncate ${option.available ? "text-gray-800" : "text-gray-500"}`}>
                      {option.name}
                    </span>
                    {!option.available && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full inline-block mt-1">
                        No disponible
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-row gap-1 flex-shrink-0">
                    <Button
                      onClick={() => onToggleAvailability(option.id, !option.available)}
                      variant="outline"
                      size="sm"
                      className="rounded-md h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title={option.available ? "Marcar como no disponible" : "Marcar como disponible"}
                    >
                      {option.available ? (
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => onDelete(option.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title="Eliminar perla"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
