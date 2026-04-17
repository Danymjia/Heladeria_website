"use client"

import { useState, useEffect } from "react"
import { X, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface Topping {
  id: string
  name: string
  available: boolean
}

interface BubbleOption {
  id: string
  name: string
  type: 'base' | 'perla'
  available: boolean
}

interface ProductOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onConfirm: (options: any) => void
}

export function ProductOptionsModal({ isOpen, onClose, product, onConfirm }: ProductOptionsModalProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [availableFlavors, setAvailableFlavors] = useState<Flavor[]>([])
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([])
  const [bubbleOptions, setBubbleOptions] = useState<BubbleOption[]>([])
  const [withCheese, setWithCheese] = useState(false)
  const [withCream, setWithCream] = useState(false)
  const [numSabores, setNumSabores] = useState<number>(1)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [selectedTopping, setSelectedTopping] = useState<string>("")
  const [selectedBase, setSelectedBase] = useState<string>("")
  const [selectedPerla, setSelectedPerla] = useState<string>("")

  const CHEESE_PRICE = 0.70
  const CREAM_PRICE = 0.70
  const EXTRA_BALL_PRICE = 0.70

  useEffect(() => {
    if (isOpen) {
      fetchFlavors()
      fetchToppings()
      fetchBubbleOptions()
      resetState()
    }
  }, [isOpen, product])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const fetchFlavors = async () => {
    try {
      const response = await fetch("/api/flavors")
      if (response.ok) {
        const data = await response.json()
        setAvailableFlavors(data.filter((f: Flavor) => f.available))
      }
    } catch (error) {
      console.error("Error fetching flavors:", error)
    }
  }

  const fetchToppings = async () => {
    try {
      const response = await fetch("/api/toppings")
      if (response.ok) {
        const data = await response.json()
        setAvailableToppings(data.filter((t: Topping) => t.available))
      }
    } catch (error) {
      console.error("Error fetching toppings:", error)
    }
  }

  const fetchBubbleOptions = async () => {
    try {
      const response = await fetch("/api/bubble-options")
      if (response.ok) {
        const data = await response.json()
        setBubbleOptions(data.filter((o: BubbleOption) => o.available))
      }
    } catch (error) {
      console.error("Error fetching bubble options:", error)
    }
  }

  const resetState = () => {
    setSelectedFlavors([])
    setWithCheese(false)
    setWithCream(false)
    setNumSabores(1)
    setSelectedOption("")
    setSelectedTopping("")
    setSelectedBase("")
    setSelectedPerla("")
  }

  const toggleFlavor = (flavorName: string) => {
    const maxFlavors = (config as any)?.maxFlavors
    if (selectedFlavors.includes(flavorName)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavorName))
    } else {
      if (maxFlavors === 1) {
        setSelectedFlavors([flavorName])
      } else {
        setSelectedFlavors([...selectedFlavors, flavorName])
      }
    }
  }

  if (!product || !isOpen) return null

  const getModalConfig = () => {
    const productName = product.name.toLowerCase()

    if (productName.includes("copa de helado con crema")) {
      return {
        type: "copa_sabores",
        title: "Copa de Helado con Crema",
        emoji: "🍦",
        options: [
          { value: 1, label: "1 Sabor", price: 1.60 },
          { value: 2, label: "2 Sabores", price: 2.10 },
          { value: 3, label: "3 Sabores", price: 2.60 },
        ]
      }
    }
    if (product.type === "helados_clasicos") {
      return { type: "helado_clasico", title: product.name, emoji: "🍨", showFlavors: true, showCheese: true, showCream: true }
    }
    if (product.type === "helados_con_queso") {
      return { type: "helado_queso", title: product.name, emoji: "🧇", showFlavors: true, showCream: true }
    }
    if (product.type === "waffles") {
      if (productName.includes("waffle wich")) {
        return { type: "waffle_complete", title: product.name, emoji: "🧇", showFlavors: true, showToppingSelector: true, showCheese: true, showCream: true }
      }
      if (productName.includes("topping")) {
        return { type: "waffle_topping", title: product.name, emoji: "🧇", showToppingSelector: true }
      }
      return { type: "waffle", title: product.name, emoji: "🧇", showFlavors: true, showCheese: true, showCream: true }
    }
    if (product.type === "fresh_fruits" && productName.includes("ensalada de frutas con crema")) {
      return { type: "fresh_fruits", title: product.name, emoji: "🍓", showExtraBall: true, showCheese: true }
    }
    if (product.type === "jugos_naturales") {
      return {
        type: "jugo", title: product.name, emoji: "🥤",
        options: [
          { value: "sin_azucar", label: "Sin azúcar" },
          { value: "con_azucar", label: "Con azúcar" },
          { value: "poca_azucar", label: "Con poca azúcar" },
        ]
      }
    }
    if (productName.includes("bubble tea")) {
      return {
        type: "bubble_tea", title: product.name, emoji: "🧋",
        options: [
          { value: "con_hielo", label: "Con hielo ❄️" },
          { value: "sin_hielo", label: "Sin hielo 🌡️" },
        ]
      }
    }
    if (productName.includes("granizado bubble")) {
      return { type: "granizado_bubble", title: product.name, emoji: "🧋", showBubbleOptions: true }
    }
    if (productName.includes("tostada caliente")) {
      return {
        type: "tostada", title: product.name, emoji: "🍞",
        options: [
          { value: "queso", label: "Solo queso 🧀" },
          { value: "jamon", label: "Solo jamón 🥩" },
          { value: "jamon_queso", label: "Jamón y Queso 🧀🥩" },
        ]
      }
    }
    if (product.type === "extras" && productName.includes("bola de helado")) {
      return { type: "bola_helado", title: product.name, emoji: "🍦", showFlavors: true, maxFlavors: 1 }
    }
    return null
  }

  const config = getModalConfig()
  if (!config) return null

  const calculateTotal = () => {
    let total = product.price
    if (config.type === "copa_sabores" && config.options) {
      const selected = (config.options as any[]).find(opt => opt.value === numSabores)
      return selected ? selected.price : total
    }
    if (withCheese) total += CHEESE_PRICE
    if (withCream) total += CREAM_PRICE
    return total
  }

  const handleConfirm = () => {
    const options: any = {
      flavors: selectedFlavors,
      withCheese, withCream, numSabores,
      selectedOption, selectedTopping, selectedBase, selectedPerla,
      finalPrice: calculateTotal()
    }
    onConfirm(options)
    resetState()
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const canConfirm = () => {
    if ((config as any).showFlavors && selectedFlavors.length === 0) return false
    if (config.type === "copa_sabores" && !numSabores) return false
    if ((config as any).options && !selectedOption) return false
    if ((config as any).showToppingSelector && !selectedTopping) return false
    if ((config as any).showBubbleOptions && (!selectedBase || !selectedPerla)) return false
    return true
  }

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{children}</p>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* ─── HEADER FIJO ─── */}
        <div className="flex-shrink-0 bg-white border-b border-zinc-100 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl leading-none flex-shrink-0">{(config as any).emoji || "🍦"}</span>
              <div className="min-w-0">
                <h2 className="font-bold text-zinc-900 text-lg leading-tight line-clamp-2">{config.title}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Personaliza tu pedido</p>
              </div>
            </div>
            {/* X SIEMPRE VISIBLE – nunca se mueve */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* ─── CONTENIDO CON SCROLL ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Copa de helado – número de sabores */}
          {config.type === "copa_sabores" && (config as any).options && (
            <div>
              <SectionLabel>¿Cuántos sabores?</SectionLabel>
              <div className="space-y-2">
                {(config as any).options.map((opt: any) => {
                  const active = numSabores === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNumSabores(opt.value)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                      }`}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className={`font-bold text-lg ${active ? "text-white" : "text-emerald-600"}`}>
                        ${opt.price.toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selección de Sabores */}
          {(config as any).showFlavors && (
            <div>
              <SectionLabel>
                Sabores
                {selectedFlavors.length > 0 && (
                  <span className="ml-2 text-zinc-900 normal-case font-bold tracking-normal">
                    · {selectedFlavors.join(" + ")}
                  </span>
                )}
              </SectionLabel>
              {availableFlavors.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-sm">No hay sabores disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableFlavors.map((flavor) => {
                    const active = selectedFlavors.includes(flavor.name)
                    return (
                      <button
                        key={flavor.id}
                        onClick={() => toggleFlavor(flavor.name)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                        }`}
                      >
                        <span className="text-sm font-medium leading-tight">{flavor.name}</span>
                        {active && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Opciones de Radio (Jugos, Bubble Tea, Tostada) */}
          {(config as any).options && config.type !== "copa_sabores" && (
            <div>
              <SectionLabel>Elige una opción</SectionLabel>
              <div className="space-y-2">
                {(config as any).options.map((opt: any) => {
                  const active = selectedOption === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedOption(opt.value)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                      }`}
                    >
                      <span className="font-medium">{opt.label}</span>
                      {active && <Check className="w-5 h-5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Toppings */}
          {(config as any).showToppingSelector && (
            <div>
              <SectionLabel>Topping</SectionLabel>
              {availableToppings.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-sm">No hay toppings disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableToppings.map((topping) => {
                    const active = selectedTopping === topping.name
                    return (
                      <button
                        key={topping.id}
                        onClick={() => setSelectedTopping(topping.name)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                          active
                            ? "border-pink-600 bg-pink-600 text-white"
                            : "border-zinc-200 hover:border-pink-300 text-zinc-700"
                        }`}
                      >
                        <span className="text-sm font-medium leading-tight">{topping.name}</span>
                        {active && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Granizado Bubble – Bases y Perlas */}
          {(config as any).showBubbleOptions && (
            <>
              <div>
                <SectionLabel>Base</SectionLabel>
                {bubbleOptions.filter(o => o.type === 'base').length === 0 ? (
                  <div className="text-center py-4 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl text-sm">
                    No hay bases disponibles
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {bubbleOptions.filter(o => o.type === 'base').map((base) => {
                      const active = selectedBase === base.name
                      return (
                        <button
                          key={base.id}
                          onClick={() => setSelectedBase(base.name)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                            active
                              ? "border-pink-600 bg-pink-600 text-white"
                              : "border-zinc-200 hover:border-pink-300 text-zinc-700"
                          }`}
                        >
                          <span className="text-sm font-medium leading-tight">{base.name}</span>
                          {active && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <SectionLabel>Perla</SectionLabel>
                {bubbleOptions.filter(o => o.type === 'perla').length === 0 ? (
                  <div className="text-center py-4 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl text-sm">
                    No hay perlas disponibles
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {bubbleOptions.filter(o => o.type === 'perla').map((perla) => {
                      const active = selectedPerla === perla.name
                      return (
                        <button
                          key={perla.id}
                          onClick={() => setSelectedPerla(perla.name)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                            active
                              ? "border-pink-600 bg-pink-600 text-white"
                              : "border-zinc-200 hover:border-pink-300 text-zinc-700"
                          }`}
                        >
                          <span className="text-sm font-medium leading-tight">{perla.name}</span>
                          {active && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Extras (Queso / Crema / Bola Extra) */}
          {((config as any).showCheese || (config as any).showCream || (config as any).showExtraBall) && (
            <div>
              <SectionLabel>Extras opcionales</SectionLabel>
              <div className="space-y-2">
                {(config as any).showCheese && (
                  <button
                    onClick={() => setWithCheese(!withCheese)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                      withCheese
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-zinc-200 hover:border-amber-300 text-zinc-700"
                    }`}
                  >
                    <span className="font-medium flex items-center gap-2">
                      🧀 Extra Queso
                    </span>
                    <span className="font-bold text-emerald-600">+${CHEESE_PRICE.toFixed(2)}</span>
                  </button>
                )}
                {(config as any).showCream && (
                  <button
                    onClick={() => setWithCream(!withCream)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                      withCream
                        ? "border-blue-400 bg-blue-50 text-blue-900"
                        : "border-zinc-200 hover:border-blue-300 text-zinc-700"
                    }`}
                  >
                    <span className="font-medium flex items-center gap-2">
                      🥛 Extra Crema
                    </span>
                    <span className="font-bold text-emerald-600">+${CREAM_PRICE.toFixed(2)}</span>
                  </button>
                )}
                {(config as any).showExtraBall && (
                  <button
                    onClick={() => setWithCream(!withCream)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                      withCream
                        ? "border-teal-400 bg-teal-50 text-teal-900"
                        : "border-zinc-200 hover:border-teal-300 text-zinc-700"
                    }`}
                  >
                    <span className="font-medium flex items-center gap-2">
                      🍦 Bola Extra de Helado
                    </span>
                    <span className="font-bold text-emerald-600">+${EXTRA_BALL_PRICE.toFixed(2)}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER FIJO ─── */}
        <div className="flex-shrink-0 bg-white border-t border-zinc-100 px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-zinc-500 font-medium">Total estimado</span>
            <span className="text-2xl font-black text-zinc-900">${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 rounded-2xl h-12 border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm()}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-12 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Agregar <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
