"use client"

import { useState, useEffect } from "react"
import { ProductTable } from "@/components/product-table"
import { FlavorManager } from "@/components/flavor-manager"
import { ToppingManager } from "@/components/topping-manager"
import { BubbleManager } from "@/components/bubble-manager"
import { UnifiedAddForm, type FormTab } from "@/components/unified-add-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, EyeOff, Trash2, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { toast, Toaster } from "react-hot-toast"

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

export default function RegisterPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [toppings, setToppings] = useState<Topping[]>([])
  const [bubbleOptions, setBubbleOptions] = useState<BubbleOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("todos")
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('producto')
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false)

  // Fetch products and flavors on mount
  useEffect(() => {
    fetchProducts()
    fetchFlavors()
    fetchToppings()
    fetchBubbleOptions()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)

        // No mostrar alertas de stock en la página de registro
        // Las alertas solo se muestran en la página de ventas
        
        // Note: Productos con stock: jugos_naturales, bebidas_calientes, acompanantes, pasteleria, extras
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast.error("Error al cargar productos")
    }
  }

  const fetchFlavors = async () => {
    try {
      const response = await fetch("/api/flavors")
      if (response.ok) {
        const data = await response.json()
        setFlavors(data)
      }
    } catch (error) {
      console.error("Error fetching flavors:", error)
      toast.error("Error al cargar sabores")
    }
  }

  const handleAddFlavor = async (name: string) => {
    try {
      const response = await fetch("/api/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const newFlavor = await response.json()
        setFlavors([...flavors, newFlavor])
        toast.success(`Sabor "${name}" agregado`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al agregar sabor")
      }
    } catch (error) {
      console.error("Error adding flavor:", error)
      toast.error("Error al agregar sabor")
    }
  }

  const handleToggleFlavorAvailability = async (id: string, available: boolean) => {
    try {
      const flavor = flavors.find(f => f.id === id)
      if (!flavor) return

      const response = await fetch(`/api/flavors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: flavor.name, available }),
      })

      if (response.ok) {
        const updated = await response.json()
        setFlavors(flavors.map(f => f.id === id ? updated : f))
        toast.success(available ? "Sabor marcado como disponible" : "Sabor marcado como no disponible")
      } else {
        toast.error("Error al actualizar sabor")
      }
    } catch (error) {
      console.error("Error updating flavor:", error)
      toast.error("Error al actualizar sabor")
    }
  }

  const handleDeleteFlavor = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este sabor?")) return

    try {
      const response = await fetch(`/api/flavors/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFlavors(flavors.filter(f => f.id !== id))
        toast.success("Sabor eliminado")
      } else {
        toast.error("Error al eliminar sabor")
      }
    } catch (error) {
      console.error("Error deleting flavor:", error)
      toast.error("Error al eliminar sabor")
    }
  }

  // Toppings Management
  const fetchToppings = async () => {
    try {
      const response = await fetch("/api/toppings")
      if (response.ok) {
        const data = await response.json()
        setToppings(data)
      }
    } catch (error) {
      console.error("Error fetching toppings:", error)
      toast.error("Error al cargar toppings")
    }
  }

  const handleAddTopping = async (name: string) => {
    try {
      const response = await fetch("/api/toppings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const newTopping = await response.json()
        setToppings([...toppings, newTopping])
        toast.success(`Topping "${name}" agregado`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al agregar topping")
      }
    } catch (error) {
      console.error("Error adding topping:", error)
      toast.error("Error al agregar topping")
    }
  }

  const handleToggleToppingAvailability = async (id: string, available: boolean) => {
    try {
      const topping = toppings.find(t => t.id === id)
      if (!topping) return

      const response = await fetch(`/api/toppings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: topping.name, available }),
      })

      if (response.ok) {
        const updated = await response.json()
        setToppings(toppings.map(t => t.id === id ? updated : t))
        toast.success(available ? "Topping marcado como disponible" : "Topping marcado como no disponible")
      } else {
        toast.error("Error al actualizar topping")
      }
    } catch (error) {
      console.error("Error updating topping:", error)
      toast.error("Error al actualizar topping")
    }
  }

  const handleDeleteTopping = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este topping?")) return

    try {
      const response = await fetch(`/api/toppings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setToppings(toppings.filter(t => t.id !== id))
        toast.success("Topping eliminado")
      } else {
        toast.error("Error al eliminar topping")
      }
    } catch (error) {
      console.error("Error deleting topping:", error)
      toast.error("Error al eliminar topping")
    }
  }

  // Bubble Options Management
  const fetchBubbleOptions = async () => {
    try {
      const response = await fetch("/api/bubble-options")
      if (response.ok) {
        const data = await response.json()
        setBubbleOptions(data)
      }
    } catch (error) {
      console.error("Error fetching bubble options:", error)
      toast.error("Error al cargar opciones de bubble")
    }
  }

  const handleAddBubbleOption = async (name: string, type: 'base' | 'perla') => {
    try {
      const response = await fetch("/api/bubble-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      })

      if (response.ok) {
        const newOption = await response.json()
        setBubbleOptions([...bubbleOptions, newOption])
        toast.success(`${type === 'base' ? 'Base' : 'Perla'} "${name}" agregada`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al agregar opción")
      }
    } catch (error) {
      console.error("Error adding bubble option:", error)
      toast.error("Error al agregar opción")
    }
  }

  const handleToggleBubbleOptionAvailability = async (id: string, available: boolean) => {
    try {
      const option = bubbleOptions.find(o => o.id === id)
      if (!option) return

      const response = await fetch(`/api/bubble-options/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: option.name, type: option.type, available }),
      })

      if (response.ok) {
        const updated = await response.json()
        setBubbleOptions(bubbleOptions.map(o => o.id === id ? updated : o))
        toast.success(available ? "Opción marcada como disponible" : "Opción marcada como no disponible")
      } else {
        toast.error("Error al actualizar opción")
      }
    } catch (error) {
      console.error("Error updating bubble option:", error)
      toast.error("Error al actualizar opción")
    }
  }

  const handleDeleteBubbleOption = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta opción?")) return

    try {
      const response = await fetch(`/api/bubble-options/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBubbleOptions(bubbleOptions.filter(o => o.id !== id))
        toast.success("Opción eliminada")
      } else {
        toast.error("Error al eliminar opción")
      }
    } catch (error) {
      console.error("Error deleting bubble option:", error)
      toast.error("Error al eliminar opción")
    }
  }

  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const newProduct = await response.json()
        setProducts([...products, newProduct])
        toast.success("Producto agregado exitosamente")
      } else {
        toast.error("Error al agregar producto")
      }
    } catch (error) {
      console.error("[v0] Error adding product:", error)
      toast.error("Error al agregar producto")
    }
  }

  const handleEditProduct = async (productData: Omit<Product, "id">) => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
        setEditingProduct(null)
        toast.success("Producto actualizado exitosamente")
      } else {
        toast.error("Error al actualizar producto")
      }
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      toast.error("Error al actualizar producto")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id))
        toast.success("Producto eliminado")
      } else {
        toast.error("Error al eliminar producto")
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast.error("Error al eliminar producto")
    }
  }

  // Get unique categories from products
  const categories = ["todos", ...Array.from(new Set(products.map(p => p.type)))]

  // Filter products by selected category
  const filteredProducts = selectedCategory === "todos" 
    ? products 
    : products.filter(p => p.type === selectedCategory)

  // Filter items by search term
  const filteredFlavors = flavors.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredToppings = toppings.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredBubbleOptions = bubbleOptions.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-zinc-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-2 sm:mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Registro de Productos</h1>
            <p className="text-xs sm:text-base text-gray-600">Administra tu inventario y controla el stock</p>
          </div>

          {/* Categories Filter - Siempre visible pero deshabilitada fuera de 'producto' */}
          <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => activeFormTab === 'producto' && setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  disabled={activeFormTab !== 'producto'}
                  className={`rounded-xl capitalize transition-all shrink-0 snap-start border ${
                    selectedCategory === category && activeFormTab === 'producto'
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-md hover:bg-zinc-800"
                      : "bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700"
                  } ${activeFormTab !== 'producto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {category === "todos" ? "Todos" : category}
                </Button>
              ))}
            </div>
          </div>


          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

            {/* Formulario - solo visible en desktop */}
            <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-6">
              <UnifiedAddForm
                onAddProduct={handleAddProduct}
                onAddFlavor={handleAddFlavor}
                onAddTopping={handleAddTopping}
                onAddBubbleOption={handleAddBubbleOption}
                activeTab={activeFormTab}
                onTabChange={(tab) => {
                  setActiveFormTab(tab)
                  setSearchTerm("") // Limpiar búsqueda al cambiar de tab
                }}
                editingProduct={editingProduct}
                onEditProduct={handleEditProduct}
                onCancelEdit={() => setEditingProduct(null)}
              />
            </div>

            <div className="lg:col-span-2">
              {/* Vista de Productos - siempre visible en mobile, en desktop solo cuando tab=producto */}
              <div className={activeFormTab !== 'producto' ? 'lg:hidden' : ''}>
                <ProductTable 
                  products={filteredProducts} 
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setIsMobileFormOpen(true);
                  }}
                  onDelete={handleDeleteProduct}
                />
              </div>
              {/* En desktop, volver a mostrar la tabla cuando tab=producto (ya está arriba via el div condicional) */}

              {/* Vista de Sabores */}
              {activeFormTab === 'sabor' && (
                <div className="hidden lg:flex bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden flex-col" style={{ maxHeight: 'calc(78vh - 100px)' }}>
                  <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                      Sabores Disponibles
                      <span className="text-sm sm:text-lg font-normal text-gray-600 ml-2">
                        ({filteredFlavors.length}/{flavors.length})
                      </span>
                    </h2>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Buscar sabores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <FlavorManager
                      flavors={filteredFlavors}
                      onToggleAvailability={handleToggleFlavorAvailability}
                      onDelete={handleDeleteFlavor}
                    />
                  </div>

                  {/* Footer con total - Siempre visible */}
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total: {flavors.length} sabores ({flavors.filter((f) => f.available).length} disponibles)
                    </p>
                  </div>
                </div>
              )}

              {/* Vista de Toppings */}
              {activeFormTab === 'topping' && (
                <div className="hidden lg:flex bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden flex-col" style={{ maxHeight: 'calc(78vh - 100px)' }}>
                  <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                      Toppings Disponibles
                      <span className="text-sm sm:text-lg font-normal text-gray-600 ml-2">
                        ({filteredToppings.length}/{toppings.length})
                      </span>
                    </h2>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Buscar toppings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <ToppingManager
                      toppings={filteredToppings}
                      onToggleAvailability={handleToggleToppingAvailability}
                      onDelete={handleDeleteTopping}
                    />
                  </div>

                  {/* Footer con total - Siempre visible */}
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total: {toppings.length} toppings ({toppings.filter((t) => t.available).length} disponibles)
                    </p>
                  </div>
                </div>
              )}

              {/* Vista de Bubble Options */}
              {activeFormTab === 'bubble' && (
                <div className="hidden lg:flex bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden flex-col" style={{ maxHeight: 'calc(78vh - 100px)' }}>
                  <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                      Opciones de Bubble
                      <span className="text-sm sm:text-lg font-normal text-gray-600 ml-2">
                        ({filteredBubbleOptions.length}/{bubbleOptions.length})
                      </span>
                    </h2>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Buscar opciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#5cbdb2] focus:ring-[#5cbdb2] text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Columna de Bases */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Bases</h3>
                        <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                          {filteredBubbleOptions.filter(opt => opt.type === 'base').length === 0 ? (
                            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                              No hay bases registradas
                            </div>
                          ) : (
                            filteredBubbleOptions.filter(opt => opt.type === 'base').map((option) => (
                              <div
                                key={option.id}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                                  option.available
                                    ? "border-gray-200 bg-white hover:shadow-md"
                                    : "border-gray-300 bg-gray-50 opacity-60"
                                }`}
                              >
                                {/* Image */}
                                <div className="flex-shrink-0 w-full">
                                  <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                                    <img 
                                      src="/base-perlas.jpg" 
                                      alt={option.name}
                                      className="w-full h-full object-cover"
                                    />
                                    {!option.available && (
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
                                  <span className={`font-medium text-xs block truncate ${option.available ? "text-gray-800" : "text-gray-500"}`}>
                                    {option.name}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 w-full justify-center">
                                  <Button
                                    onClick={() => handleToggleBubbleOptionAvailability(option.id, !option.available)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-md h-7 w-7 p-0"
                                    title={option.available ? "Marcar como no disponible" : "Marcar como disponible"}
                                  >
                                    {option.available ? (
                                      <Eye className="w-3 h-3" />
                                    ) : (
                                      <EyeOff className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteBubbleOption(option.id)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 p-0"
                                    title="Eliminar base"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Columna de Perlas */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Perlas</h3>
                        <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                          {filteredBubbleOptions.filter(opt => opt.type === 'perla').length === 0 ? (
                            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                              No hay perlas registradas
                            </div>
                          ) : (
                            filteredBubbleOptions.filter(opt => opt.type === 'perla').map((option) => (
                              <div
                                key={option.id}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                                  option.available
                                    ? "border-gray-200 bg-white hover:shadow-md"
                                    : "border-gray-300 bg-gray-50 opacity-60"
                                }`}
                              >
                                {/* Image */}
                                <div className="flex-shrink-0 w-full">
                                  <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                                    <img 
                                      src="/perlas.jpg" 
                                      alt={option.name}
                                      className="w-full h-full object-cover"
                                    />
                                    {!option.available && (
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
                                  <span className={`font-medium text-xs block truncate ${option.available ? "text-gray-800" : "text-gray-500"}`}>
                                    {option.name}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 w-full justify-center">
                                  <Button
                                    onClick={() => handleToggleBubbleOptionAvailability(option.id, !option.available)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-md h-7 w-7 p-0"
                                    title={option.available ? "Marcar como no disponible" : "Marcar como disponible"}
                                  >
                                    {option.available ? (
                                      <Eye className="w-3 h-3" />
                                    ) : (
                                      <EyeOff className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteBubbleOption(option.id)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 h-7 w-7 p-0"
                                    title="Eliminar perla"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer con total - Siempre visible */}
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total: {bubbleOptions.length} opciones ({bubbleOptions.filter(opt => opt.type === 'base').length} bases, {bubbleOptions.filter(opt => opt.type === 'perla').length} perlas)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB - Solo móvil */}
      <button
        onClick={() => setIsMobileFormOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-zinc-900 hover:bg-zinc-700 active:scale-95 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200"
        aria-label="Agregar"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Mobile Form Modal - Bottom Sheet */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setIsMobileFormOpen(false); setEditingProduct(null); }}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-zinc-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-zinc-100">
              <span className="font-bold text-zinc-800 text-base">
                {activeFormTab === 'producto' ? (editingProduct ? 'Editar Producto' : 'Nuevo Producto') : activeFormTab === 'sabor' ? 'Sabores' : activeFormTab === 'topping' ? 'Toppings' : 'Opciones Bubble'}
              </span>
              <button
                onClick={() => { setIsMobileFormOpen(false); setEditingProduct(null); }}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switcher - todos los tabs */}
            <div className="grid grid-cols-4 gap-1.5 px-5 pt-3 pb-2 flex-shrink-0">
              {(['producto', 'sabor', 'topping', 'bubble'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFormTab(tab)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFormTab === tab
                      ? 'bg-zinc-900 text-white shadow'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {tab === 'producto' ? 'Producto' : tab === 'sabor' ? 'Sabor' : tab === 'topping' ? 'Topping' : 'Bubble'}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pb-8">

              {/* Formulario compacto para sabor/topping/bubble */}
              {activeFormTab === 'sabor' && (
                <form
                  onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('flavorNameMobile') as HTMLInputElement); if (input?.value.trim()) { handleAddFlavor(input.value.trim()); input.value = ''; } }}
                  className="flex flex-col gap-2 mb-5 mt-3"
                >
                  <input
                    name="flavorNameMobile"
                    placeholder="Nombre del sabor..."
                    required
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  />
                  <button type="submit" className="w-full bg-zinc-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar Sabor
                  </button>
                </form>
              )}

              {activeFormTab === 'topping' && (
                <form
                  onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('toppingNameMobile') as HTMLInputElement); if (input?.value.trim()) { handleAddTopping(input.value.trim()); input.value = ''; } }}
                  className="flex flex-col gap-2 mb-5 mt-3"
                >
                  <input
                    name="toppingNameMobile"
                    placeholder="Nombre del topping..."
                    required
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  />
                  <button type="submit" className="w-full bg-zinc-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar Topping
                  </button>
                </form>
              )}

              {activeFormTab === 'bubble' && (
                <form
                  onSubmit={(e) => { e.preventDefault(); const nameInput = (e.currentTarget.elements.namedItem('bubbleNameMobile') as HTMLInputElement); const typeInput = (e.currentTarget.elements.namedItem('bubbleTypeMobile') as HTMLSelectElement); if (nameInput?.value.trim()) { handleAddBubbleOption(nameInput.value.trim(), typeInput.value as 'base' | 'perla'); nameInput.value = ''; } }}
                  className="flex flex-col gap-2 mb-5 mt-3"
                >
                  <div className="flex gap-2">
                    <select
                      name="bubbleTypeMobile"
                      defaultValue="base"
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 bg-white"
                    >
                      <option value="base">Base</option>
                      <option value="perla">Perla</option>
                    </select>
                    <input
                      name="bubbleNameMobile"
                      placeholder="Nombre..."
                      required
                      className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-zinc-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar Bubble
                  </button>
                </form>
              )}

              {/* Lista de sabores */}
              {activeFormTab === 'sabor' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">{flavors.length} sabores · {flavors.filter(f => f.available).length} disponibles</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {flavors.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-zinc-400 text-sm">No hay sabores registrados</div>
                    ) : (
                      flavors.map((flavor) => (
                        <div
                          key={flavor.id}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${flavor.available ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-300 bg-gray-50 opacity-60'}`}
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                            <img src="/bola-de-helado.jpg" alt={flavor.name} className="w-full h-full object-cover" />
                            {!flavor.available && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[9px] font-bold rotate-[-12deg] bg-red-600/90 text-white px-1.5 py-0.5 rounded leading-none shadow-md">NO DISP.</span>
                              </div>
                            )}
                          </div>
                          <span className={`font-medium text-[11px] text-center block w-full truncate ${flavor.available ? 'text-gray-800' : 'text-gray-500'}`}>{flavor.name}</span>
                          <div className="flex gap-1 w-full justify-center">
                            <button
                              onClick={() => handleToggleFlavorAvailability(flavor.id, !flavor.available)}
                              className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 text-zinc-500"
                              title={flavor.available ? 'No disponible' : 'Disponible'}
                            >
                              {flavor.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleDeleteFlavor(flavor.id)}
                              className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-red-50 text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Lista de toppings */}
              {activeFormTab === 'topping' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">{toppings.length} toppings · {toppings.filter(t => t.available).length} disponibles</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {toppings.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-zinc-400 text-sm">No hay toppings registrados</div>
                    ) : (
                      toppings.map((topping) => (
                        <div
                          key={topping.id}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${topping.available ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-300 bg-gray-50 opacity-60'}`}
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                            <img src="/crema.jpg" alt={topping.name} className="w-full h-full object-cover" />
                            {!topping.available && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[9px] font-bold rotate-[-12deg] bg-red-600/90 text-white px-1.5 py-0.5 rounded leading-none shadow-md">NO DISP.</span>
                              </div>
                            )}
                          </div>
                          <span className={`font-medium text-[11px] text-center block w-full truncate ${topping.available ? 'text-gray-800' : 'text-gray-500'}`}>{topping.name}</span>
                          <div className="flex gap-1 w-full justify-center">
                            <button
                              onClick={() => handleToggleToppingAvailability(topping.id, !topping.available)}
                              className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 text-zinc-500"
                              title={topping.available ? 'No disponible' : 'Disponible'}
                            >
                              {topping.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleDeleteTopping(topping.id)}
                              className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-red-50 text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Lista de bubble options */}
              {activeFormTab === 'bubble' && (
                <div className="space-y-5">
                  {/* Bases */}
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-2">Bases ({bubbleOptions.filter(o => o.type === 'base').length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {bubbleOptions.filter(o => o.type === 'base').length === 0 ? (
                        <div className="col-span-full text-center py-4 text-zinc-400 text-sm">Sin bases</div>
                      ) : (
                        bubbleOptions.filter(o => o.type === 'base').map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${opt.available ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-300 bg-gray-50 opacity-60'}`}
                          >
                            <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                              <img src="/base-perlas.jpg" alt={opt.name} className="w-full h-full object-cover" />
                              {!opt.available && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[9px] font-bold rotate-[-12deg] bg-red-600/90 text-white px-1.5 py-0.5 rounded leading-none shadow-md">NO DISP.</span>
                                </div>
                              )}
                            </div>
                            <span className={`font-medium text-[11px] text-center block w-full truncate ${opt.available ? 'text-gray-800' : 'text-gray-500'}`}>{opt.name}</span>
                            <div className="flex gap-1 w-full justify-center">
                              <button onClick={() => handleToggleBubbleOptionAvailability(opt.id, !opt.available)} className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 text-zinc-500">
                                {opt.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                              <button onClick={() => handleDeleteBubbleOption(opt.id)} className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-red-50 text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {/* Perlas */}
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-2">Perlas ({bubbleOptions.filter(o => o.type === 'perla').length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {bubbleOptions.filter(o => o.type === 'perla').length === 0 ? (
                        <div className="col-span-full text-center py-4 text-zinc-400 text-sm">Sin perlas</div>
                      ) : (
                        bubbleOptions.filter(o => o.type === 'perla').map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${opt.available ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-300 bg-gray-50 opacity-60'}`}
                          >
                            <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                              <img src="/perlas.jpg" alt={opt.name} className="w-full h-full object-cover" />
                              {!opt.available && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[9px] font-bold rotate-[-12deg] bg-red-600/90 text-white px-1.5 py-0.5 rounded leading-none shadow-md">NO DISP.</span>
                                </div>
                              )}
                            </div>
                            <span className={`font-medium text-[11px] text-center block w-full truncate ${opt.available ? 'text-gray-800' : 'text-gray-500'}`}>{opt.name}</span>
                            <div className="flex gap-1 w-full justify-center">
                              <button onClick={() => handleToggleBubbleOptionAvailability(opt.id, !opt.available)} className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 text-zinc-500">
                                {opt.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                              <button onClick={() => handleDeleteBubbleOption(opt.id)} className="rounded-md h-7 w-7 flex items-center justify-center border border-zinc-200 hover:bg-red-50 text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Para el tab producto, solo el formulario */}
              {activeFormTab === 'producto' && (
                <UnifiedAddForm
                  onAddProduct={(p) => { handleAddProduct(p); setIsMobileFormOpen(false); }}
                  onAddFlavor={(n) => { handleAddFlavor(n); setIsMobileFormOpen(false); }}
                  onAddTopping={(n) => { handleAddTopping(n); setIsMobileFormOpen(false); }}
                  onAddBubbleOption={(n, t) => { handleAddBubbleOption(n, t); setIsMobileFormOpen(false); }}
                  activeTab={activeFormTab}
                  onTabChange={(tab) => { setActiveFormTab(tab); }}
                  editingProduct={editingProduct}
                  onEditProduct={(p) => { handleEditProduct(p); setIsMobileFormOpen(false); }}
                  onCancelEdit={() => { setEditingProduct(null); setIsMobileFormOpen(false); }}
                  hideTabs
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
