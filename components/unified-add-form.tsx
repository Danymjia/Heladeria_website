"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type FormTab = 'producto' | 'sabor' | 'topping' | 'bubble'

interface UnifiedAddFormProps {
  onAddProduct: (product: { name: string; type: string; price: number; stock: number }) => void
  onAddFlavor: (name: string) => void
  onAddTopping: (name: string) => void
  onAddBubbleOption: (name: string, type: 'base' | 'perla') => void
  activeTab?: FormTab
  onTabChange?: (tab: FormTab) => void
  editingProduct?: { id: string; name: string; type: string; price: number; stock: number } | null
  onEditProduct?: (product: { name: string; type: string; price: number; stock: number }) => void
  onCancelEdit?: () => void
  hideTabs?: boolean
}

export function UnifiedAddForm({ 
  onAddProduct, 
  onAddFlavor, 
  onAddTopping, 
  onAddBubbleOption,
  activeTab: externalActiveTab,
  onTabChange,
  editingProduct,
  onEditProduct,
  onCancelEdit,
  hideTabs = false,
}: UnifiedAddFormProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<FormTab>('producto')
  
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab
  
  const handleTabChange = (tab: FormTab) => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }
  
  // Product form state
  const [productName, setProductName] = useState("")
  const [productType, setProductType] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productStock, setProductStock] = useState("")
  
  // Flavor form state
  const [flavorName, setFlavorName] = useState("")
  
  // Topping form state
  const [toppingName, setToppingName] = useState("")
  
  // Bubble option form state
  const [bubbleName, setBubbleName] = useState("")
  const [bubbleType, setBubbleType] = useState<'base' | 'perla'>('base')

  // Update form fields when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name)
      setProductType(editingProduct.type)
      setProductPrice(editingProduct.price.toString())
      setProductStock(editingProduct.stock.toString())
    } else {
      setProductName("")
      setProductType("")
      setProductPrice("")
      setProductStock("")
    }
  }, [editingProduct])

  const requiresStock = (type: string) => {
    return ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria", "extras"].includes(type.toLowerCase())
  }

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || !productType || !productPrice) return
    if (requiresStock(productType) && !productStock) return

    const productData = {
      name: productName,
      type: productType,
      price: Number.parseFloat(productPrice),
      stock: requiresStock(productType) ? Number.parseInt(productStock) : 0,
    }

    if (editingProduct && onEditProduct) {
      onEditProduct(productData)
    } else {
      onAddProduct(productData)
    }

    // Reset form if not editing
    if (!editingProduct) {
      setProductName("")
      setProductType("")
      setProductPrice("")
      setProductStock("")
    }
  }

  const handleFlavorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (flavorName.trim()) {
      onAddFlavor(flavorName.trim())
      setFlavorName("")
    }
  }

  const handleToppingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (toppingName.trim()) {
      onAddTopping(toppingName.trim())
      setToppingName("")
    }
  }

  const handleBubbleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bubbleName.trim()) {
      onAddBubbleOption(bubbleName.trim(), bubbleType)
      setBubbleName("")
    }
  }

  const tabs = [
    { id: 'producto' as FormTab, label: 'Producto'},
    { id: 'sabor' as FormTab, label: 'Sabor'},
    { id: 'topping' as FormTab, label: 'Topping'},
    { id: 'bubble' as FormTab, label: 'Bubble'},
  ]

  return (
    <div className={hideTabs ? "flex flex-col" : "bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg lg:h-[calc(78vh-100px)] flex flex-col"}>
      {/* Tab Buttons */}
      {!hideTabs && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-6 flex-shrink-0">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`rounded-lg sm:rounded-xl h-12 sm:h-14 text-sm sm:text-base font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white shadow-md hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {/* Product Form */}
      {activeTab === 'producto' && (
        <form onSubmit={handleProductSubmit} className="flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
          </h2>

          <div className="space-y-4 flex-1">
            <div>
              <Label htmlFor="name" className="text-sm sm:text-base text-gray-700">
                Nombre del Producto
              </Label>
              <Input
                id="name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Helado de Vainilla"
                required
                className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-sm sm:text-base text-gray-700">
                Tipo
              </Label>
              <Select value={productType} onValueChange={setProductType} required>
                <SelectTrigger className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 text-sm sm:text-base">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helados_clasicos">Helados Clásicos</SelectItem>
                  <SelectItem value="helados_con_queso">Helados con Queso</SelectItem>
                  <SelectItem value="waffles">Waffles</SelectItem>
                  <SelectItem value="fresh_fruits">Fresh Fruits</SelectItem>
                  <SelectItem value="jugos_naturales">Jugos Naturales</SelectItem>
                  <SelectItem value="bebidas_frias">Bebidas Frías</SelectItem>
                  <SelectItem value="bebidas_calientes">Bebidas Calientes</SelectItem>
                  <SelectItem value="acompanantes">Acompañantes</SelectItem>
                  <SelectItem value="pasteleria">Pastelería</SelectItem>
                  <SelectItem value="extras">Extras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm sm:text-base text-gray-700">
                  Precio ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
                />
              </div>

              <div>
                <Label htmlFor="stock" className="text-sm sm:text-base text-gray-700">
                  Stock {!requiresStock(productType) && <span className="text-xs text-gray-500">(Opcional)</span>}
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  placeholder="0"
                  required={requiresStock(productType)}
                  disabled={!requiresStock(productType)}
                  className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-6">
            <Button
              type="submit"
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg sm:rounded-xl h-11 transition-all hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingProduct ? "Actualizar" : "Agregar Producto"}
            </Button>
            {editingProduct && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="flex-1 rounded-lg sm:rounded-xl border-gray-300 bg-transparent text-sm sm:text-base"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Flavor Form */}
      {activeTab === 'sabor' && (
        <form onSubmit={handleFlavorSubmit} className="flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            Agregar Nuevo Sabor
          </h2>

          <div className="space-y-4 flex-1">
            <div>
              <Label htmlFor="flavorName" className="text-sm sm:text-base text-gray-700">
                Nombre del Sabor
              </Label>
              <Input
                id="flavorName"
                value={flavorName}
                onChange={(e) => setFlavorName(e.target.value)}
                placeholder="Ej: Vainilla, Chocolate..."
                required
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleFlavorSubmit(e)
                  }
                }}
                className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg sm:rounded-xl h-11 transition-all hover:-translate-y-0.5 text-sm sm:text-base mt-4 sm:mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Sabor
          </Button>
        </form>
      )}

      {/* Topping Form */}
      {activeTab === 'topping' && (
        <form onSubmit={handleToppingSubmit} className="flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            Agregar Nuevo Topping
          </h2>

          <div className="space-y-4 flex-1">
            <div>
              <Label htmlFor="toppingName" className="text-sm sm:text-base text-gray-700">
                Nombre del Topping
              </Label>
              <Input
                id="toppingName"
                value={toppingName}
                onChange={(e) => setToppingName(e.target.value)}
                placeholder="Ej: M&M, Oreo..."
                required
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleToppingSubmit(e)
                  }
                }}
                className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg sm:rounded-xl h-11 transition-all hover:-translate-y-0.5 text-sm sm:text-base mt-4 sm:mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Topping
          </Button>
        </form>
      )}

      {/* Bubble Option Form */}
      {activeTab === 'bubble' && (
        <form onSubmit={handleBubbleSubmit} className="flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            Agregar Opción de Bubble
          </h2>

          <div className="space-y-4 flex-1">
            <div>
              <Label className="text-sm sm:text-base text-gray-700 mb-2 block">
                Tipo de Opción
              </Label>
              <Select value={bubbleType} onValueChange={(v) => setBubbleType(v as 'base' | 'perla')}>
                <SelectTrigger className="rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="perla">Perla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bubbleName" className="text-sm sm:text-base text-gray-700">
                Nombre
              </Label>
              <Input
                id="bubbleName"
                value={bubbleName}
                onChange={(e) => setBubbleName(e.target.value)}
                placeholder="Ej: Manzana verde, Mora azul..."
                required
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleBubbleSubmit(e)
                  }
                }}
                className="mt-1.5 rounded-lg sm:rounded-xl border-zinc-300 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg sm:rounded-xl h-11 transition-all hover:-translate-y-0.5 text-sm sm:text-base mt-4 sm:mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar {bubbleType === 'base' ? 'Base' : 'Perla'}
          </Button>
        </form>
      )}
    </div>
  )
}
