"use client"

import React, { useState } from "react"
import { Edit, Trash2, Search, AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Product {
  id: string
  name: string
  type: string
  price: number
  stock: number
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Check if product type requires stock
  const requiresStock = (type: string) => {
    return ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria", "extras"].includes(type.toLowerCase())
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col h-[calc(85vh-50px)] lg:h-[calc(78vh-100px)]">
      <div className="p-6 border-b border-zinc-300 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-2xl font-bold text-gray-800">
            Productos Registrados
            {products.length > 0 && (
              <span className="text-xs sm:text-lg font-normal text-gray-500 ml-1.5">
                ({filteredProducts.length}/{products.length})
              </span>
            )}
          </h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700 w-full sm:w-[45%] lg:w-auto">Nombre</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Categoría</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden lg:table-cell text-center">Inventario</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left md:text-center w-24 md:w-32">Precio</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right w-16 lg:hidden">MÁS</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right hidden lg:table-cell pr-6 w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-zinc-500">
                  {searchTerm ? `No se encontraron productos con "${searchTerm}"` : "No hay productos registrados. ¡Agrega tu primer producto!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const needsStock = requiresStock(product.type)
                const isOutOfStock = needsStock && product.stock === 0
                
                return (
                  <React.Fragment key={product.id}>
                    {/* Fila Principal (Nombre y Precio) */}
                    <TableRow 
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 ${isOutOfStock ? "opacity-60" : ""} ${expandedId === product.id ? "bg-zinc-50 lg:bg-transparent" : ""} lg:cursor-default`}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setExpandedId(expandedId === product.id ? null : product.id)
                        }
                      }}
                    >
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base truncate max-w-[120px] sm:max-w-full">{product.name}</span>
                          {isOutOfStock && (
                            <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">Agotado</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell capitalize font-medium text-zinc-600">
                        {product.type.replace('_', ' ')}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          {needsStock ? (
                            <>
                              <span className={`font-bold tracking-wide ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-orange-500" : "text-emerald-500"}`}>
                                {product.stock}
                              </span>
                              {product.stock > 0 && product.stock <= 5 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                            </>
                          ) : (
                            <span className="text-zinc-400 text-sm italic">Ilimitado</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-900 font-bold text-left md:text-center text-base md:text-lg">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      
                      <TableCell className="text-right lg:hidden">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-zinc-500 pointer-events-none">
                          {expandedId === product.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                        </Button>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-right">
                        <div className="flex justify-end gap-2 pr-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                            className="hover:bg-sky-50 hover:text-sky-700 text-zinc-500 rounded-lg h-9"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            className="hover:bg-red-50 hover:text-red-700 text-zinc-500 rounded-lg h-9"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>


                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Modal for Product Details */}
      {expandedId && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 lg:hidden animate-in fade-in duration-200">
          <div 
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const product = products.find(p => p.id === expandedId)
              if (!product) return null
              const needsStock = requiresStock(product.type)
              return (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 leading-tight pr-4">{product.name}</h3>
                      <p className="text-2xl font-black text-emerald-600 mt-2">${product.price.toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setExpandedId(null)}
                      className="h-10 w-10 p-0 shrink-0 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Categoría</span>
                      <span className="capitalize text-zinc-800 font-bold text-sm">{product.type.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Inventario</span>
                      <div className="flex items-center gap-2">
                        {needsStock ? (
                          <>
                            <span className={`font-black text-lg ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-orange-500" : "text-emerald-500"}`}>
                              {product.stock}
                            </span>
                            {product.stock > 0 && product.stock <= 5 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          </>
                        ) : (
                          <span className="text-zinc-500 text-sm font-medium">Ilimitado</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white hover:bg-sky-50 text-sky-700 border-sky-200 hover:border-sky-300 rounded-xl h-12 shadow-sm"
                      onClick={() => { setExpandedId(null); onEdit(product); }}
                    >
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300 rounded-xl h-12 shadow-sm"
                      onClick={() => { setExpandedId(null); onDelete(product.id); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Borrar
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
