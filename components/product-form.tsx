"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFormProps {
  onSubmit: (product: {
    name: string
    type: string
    price: number
    stock: number
  }) => void
  editingProduct?: {
    id: string
    name: string
    type: string
    price: number
    stock: number
  } | null
  onCancel?: () => void
}

export function ProductForm({ onSubmit, editingProduct, onCancel }: ProductFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  // Update form fields when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name)
      setType(editingProduct.type)
      setPrice(editingProduct.price.toString())
      setStock(editingProduct.stock.toString())
    } else {
      setName("")
      setType("")
      setPrice("")
      setStock("")
    }
  }, [editingProduct])

  // Check if the selected type requires stock
  const requiresStock = (productType: string) => {
    return ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria", "extras"].includes(productType.toLowerCase())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!name || !type || !price) return
    
    // Only validate stock if the product type requires it
    if (requiresStock(type) && !stock) {
      return
    }

    onSubmit({
      name,
      type,
      price: Number.parseFloat(price),
      stock: requiresStock(type) ? Number.parseInt(stock) : 0,
    })

    // Reset form if not editing
    if (!editingProduct) {
      setName("")
      setType("")
      setPrice("")
      setStock("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
      </h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-700">
            Nombre del Producto
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Helado de Vainilla"
            required
            className="mt-1.5 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400"
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-gray-700">
            Tipo
          </Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger className="mt-1.5 rounded-xl border-gray-200">
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
            <Label htmlFor="price" className="text-gray-700">
              Precio ($)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="mt-1.5 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          <div>
            <Label htmlFor="stock" className="text-gray-700">
              Stock {!requiresStock(type) && <span className="text-xs text-gray-500">(Opcional)</span>}
            </Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              required={requiresStock(type)}
              disabled={!requiresStock(type)}
              className="mt-1.5 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingProduct ? "Actualizar" : "Agregar Producto"}
          </Button>
          {editingProduct && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl border-gray-300 bg-transparent"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
