"use client"

import { useState, useEffect, useRef } from "react"
import { ShoppingCart, History, Search, Plus, X, Clock, ArrowLeft, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { ProductOptionsModal } from "@/components/product-options-modal"
import { SalesHistoryModal } from "@/components/sales-history-modal"
import Link from "next/link"
import { PendingOrdersModal } from "@/components/pending-orders-modal"
import { toast, Toaster } from "react-hot-toast"

interface Product {
  id: string
  name: string
  type: string
  price: number
  stock: number
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  flavor?: string
  withCheese?: boolean
  withCream?: boolean
  selectedOption?: string
  selectedTopping?: string
  selectedBase?: string
  selectedPerla?: string
  numSabores?: number
}

interface Sale {
  id: string
  created_at: string
  items: {
    name: string
    quantity: number
    price: number
    subtotal: number
  }[]
  total: number
  payment_method: string
  status: string
}

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo")
  const [showHistory, setShowHistory] = useState(false)
  const [salesHistory, setSalesHistory] = useState<Sale[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const productsRef = useRef<HTMLDivElement>(null)
  const [isOrderExpanded, setIsOrderExpanded] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchPendingOrders()
    
    // Polling every 10 seconds for pending orders
    const interval = setInterval(() => {
      fetchPendingOrders()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  const fetchPendingOrders = async () => {
    try {
      const res = await fetch("/api/sales/pending")
      if (res.ok) {
        const data = await res.json()
        setPendingOrders(data)
      }
    } catch (e) {
      console.error("Error fetching pending orders", e)
    }
  }

  const handleMarkAsDelivered = async (id: string) => {
    try {
      const res = await fetch(`/api/sales/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "entregado" }),
      })
      if (res.ok) {
        toast.success("Orden marcada como entregada")
        fetchPendingOrders()
      } else {
        toast.error("Error al actualizar la orden")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchSalesHistory = async () => {
    try {
      const response = await fetch("/api/sales/today")
      if (response.ok) {
        const data = await response.json()
        setSalesHistory(data)
      }
    } catch (error) {
      console.error("Error fetching sales history:", error)
      toast.error("Error al cargar el historial")
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        // Show all products - products without stock requirement are always available
        setProducts(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast.error("Error al cargar productos")
    }
  }

  // Get unique categories from products
  const categories = ["todos", ...Array.from(new Set(products.map(p => p.type)))]

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setShowProductsModal(true)
    setSearchTerm("") // Limpiar búsqueda al abrir modal
  }

  const handleCloseProductsModal = () => {
    setShowProductsModal(false)
    setSelectedCategory("")
    setSearchTerm("")
  }

  // Filter products by selected category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "todos" || product.type === selectedCategory
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToOrder = (product: Product) => {
    const productName = product.name.toLowerCase()
    const productType = product.type.toLowerCase()
    
    // Productos que necesitan modal de opciones
    const needsModal = 
      ["helados_clasicos", "helados_con_queso", "waffles", "jugos_naturales"].includes(productType) ||
      (productType === "fresh_fruits" && productName.includes("ensalada de frutas con crema")) ||
      (productType === "bebidas_frias" && (productName.includes("bubble tea") || productName.includes("granizado bubble"))) ||
      (productType === "extras" && productName.includes("bola de helado")) ||
      productName.includes("tostada caliente")

    if (needsModal) {
      setSelectedProduct(product)
      setShowOptionsModal(true)
      return
    }

    // Para otros productos, agregar directamente
    addProductToOrder(product, {})
  }

  const addProductToOrder = (product: Product, options: any) => {
    const requiresStock = (type: string) => ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria", "extras"].includes(type.toLowerCase())
    
    // Check low stock warning before adding
    if (requiresStock(product.type) && product.stock > 0 && product.stock <= 3) {
      toast(`⚠️ Poco stock de ${product.name} (quedan ${product.stock} unidades)`, {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FCD34D',
        },
      })
    }
    
    // Update visual stock only for products that require it
    if (requiresStock(product.type)) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
      )
    }

    // Calculate final price
    let finalPrice = options.finalPrice || product.price

    // Create display name with all options
    let displayName = product.name
    
    if (options.flavors && options.flavors.length > 0) {
      displayName += ` (${options.flavors.join(" + ")})`
    }
    
    if (options.numSabores && options.numSabores > 1) {
      displayName += ` - ${options.numSabores} Sabores`
    }
    
    if (options.selectedOption) {
      const optionLabels: any = {
        sin_azucar: "Sin azúcar",
        con_azucar: "Con azúcar",
        poca_azucar: "Poca azúcar",
        con_hielo: "Con hielo",
        sin_hielo: "Sin hielo",
        queso: "Solo queso",
        jamon: "Solo jamón",
        jamon_queso: "Jamón y Queso"
      }
      displayName += ` - ${optionLabels[options.selectedOption] || options.selectedOption}`
    }
    
    if (options.selectedTopping) {
      displayName += ` + ${options.selectedTopping}`
    }
    
    if (options.selectedBase) {
      displayName += ` - Base: ${options.selectedBase}`
    }
    
    if (options.selectedPerla) {
      displayName += ` - Perla: ${options.selectedPerla}`
    }
    
    if (options.withCheese) {
      displayName += " + Queso"
    }
    
    if (options.withCream) {
      displayName += " + Crema"
    }

    // Create unique key for the item based on all options
    const itemKey = JSON.stringify({
      id: product.id,
      flavors: (options.flavors || []).sort(), // Sort to ensure same flavors in different order match
      withCheese: options.withCheese || false,
      withCream: options.withCream || false,
      selectedOption: options.selectedOption || "",
      selectedTopping: options.selectedTopping || "",
      selectedBase: options.selectedBase || "",
      selectedPerla: options.selectedPerla || "",
      numSabores: options.numSabores || 0
    })

    // Check if exact same item exists
    const existingItemIndex = orderItems.findIndex((item) => {
      const existingKey = JSON.stringify({
        id: item.id,
        flavors: (item.flavor?.split(" + ") || []).sort(),
        withCheese: item.withCheese || false,
        withCream: item.withCream || false,
        selectedOption: item.selectedOption || "",
        selectedTopping: item.selectedTopping || "",
        selectedBase: item.selectedBase || "",
        selectedPerla: item.selectedPerla || "",
        numSabores: item.numSabores || 0
      })
      return existingKey === itemKey
    })
    
    if (existingItemIndex !== -1) {
      // Item already exists, increment quantity
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      }
      setOrderItems(updatedItems)
    } else {
      // New item, add to order
      setOrderItems([
        ...orderItems,
        {
          id: product.id,
          name: displayName,
          price: finalPrice,
          quantity: 1,
          flavor: options.flavors?.join(" + ") || "",
          withCheese: options.withCheese || false,
          withCream: options.withCream || false,
          selectedOption: options.selectedOption || "",
          selectedTopping: options.selectedTopping || "",
          selectedBase: options.selectedBase || "",
          selectedPerla: options.selectedPerla || "",
          numSabores: options.numSabores || 0
        },
      ])
    }

    toast.success(`${displayName} agregado a la orden`)
  }

  const handleOptionsConfirm = (options: any) => {
    if (selectedProduct) {
      addProductToOrder(selectedProduct, options)
      setShowOptionsModal(false)
      setSelectedProduct(null)
    }
  }

  const handleRemoveItem = (index: number) => {
    const item = orderItems[index]
    if (!item) return

    const requiresStock = (type: string) => ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria"].includes(type.toLowerCase())
    const product = products.find((p) => p.id === item.id)

    if (item.quantity > 1) {
      // Reduce quantity by 1
      const updatedItems = [...orderItems]
      updatedItems[index] = { ...item, quantity: item.quantity - 1 }
      setOrderItems(updatedItems)
      
      // Restore stock for 1 unit
      if (product && requiresStock(product.type)) {
        setProducts(
          products.map((p) => (p.id === item.id ? { ...p, stock: p.stock + 1 } : p))
        )
      }
    } else {
      // Remove item completely
      setOrderItems(orderItems.filter((_, i) => i !== index))
      
      // Restore stock for 1 unit
      if (product && requiresStock(product.type)) {
        setProducts(
          products.map((p) => (p.id === item.id ? { ...p, stock: p.stock + 1 } : p))
        )
      }
    }
  }

  const handleSubmitOrder = async (selectedPaymentMethod: string) => {
    if (orderItems.length === 0) {
      toast.error("La orden está vacía")
      return
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: orderItems,
          paymentMethod: selectedPaymentMethod
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        toast.success("Orden enviada a preparación ✅")
        console.log("Venta creada con ID:", data.id)
        
        setOrderItems([])
        setPaymentMethod("efectivo") // Reset to default
        fetchProducts() // Refresh products to get updated stock
        fetchPendingOrders() // Refresh pending orders list
      } else {
        toast.error("Error al enviar la orden")
      }
    } catch (error) {
      console.error("[v0] Error submitting order:", error)
      toast.error("Error al enviar la orden")
    }
  }

  const handleShowHistory = async () => {
    await fetchSalesHistory()
    setShowHistory(true)
  }

  const handleFinishDay = async () => {
    if (!confirm("¿Estás seguro de finalizar el día? Esto generará el reporte PDF.")) {
      return
    }

    const loadingToast = toast.loading("Preparando reporte de ventas...")
    setIsGeneratingPdf(true)

    try {
      const res = await fetch("/api/sales/today")
      if (!res.ok) throw new Error("Error al obtener las ventas")
      
      const sales = await res.json()
      
      if (sales.length === 0) {
        toast.dismiss(loadingToast)
        toast("No hay ventas registradas hoy para generar el reporte.", { icon: "ℹ️" })
        setIsGeneratingPdf(false)
        return
      }

      // ── Metrics ───────────────────────────────────────────────
      const totalRevenue = sales.reduce((s: number, v: any) => s + (Number(v.total) || 0), 0)
      const cashRevenue  = sales.filter((s: any) => s.payment_method === 'efectivo').reduce((s: number, v: any) => s + (Number(v.total) || 0), 0)
      const transRevenue = sales.filter((s: any) => s.payment_method === 'transferencia').reduce((s: number, v: any) => s + (Number(v.total) || 0), 0)
      const avgTicket    = totalRevenue / sales.length
      const dateStr      = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const timeStr      = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

      // Product frequency map
      const productMap: Record<string, number> = {}
      sales.forEach((sale: any) => {
        ;(sale.items || []).forEach((item: any) => {
          if (item && item.name) {
            const base = item.name.split('(')[0].trim()
            productMap[base] = (productMap[base] || 0) + (item.quantity || 1)
          }
        })
      })
      const topProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

      // ── Colors ────────────────────────────────────────────────
      const DARK:   [number,number,number] = [28,  28,  28 ]
      const TEAL:   [number,number,number] = [80,  180, 170]
      const LIGHT:  [number,number,number] = [245, 247, 250]
      const WHITE:  [number,number,number] = [255, 255, 255]
      const GRAY:   [number,number,number] = [130, 130, 130]
      const GREEN:  [number,number,number] = [34,  197, 94 ]
      const ORANGE: [number,number,number] = [249, 115, 22 ]
      const BLUE:   [number,number,number] = [59,  130, 246]
      const pageW = 210
      const margin = 14

      const doc = new jsPDF()

      // ── Header bar ────────────────────────────────────────────
      doc.setFillColor(...DARK)
      doc.rect(0, 0, pageW, 38, 'F')
      doc.setFillColor(...TEAL)
      doc.rect(0, 35, pageW, 4, 'F')

      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('Ciocolatto', margin, 17)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text('Gestor de Heladería · Reporte de Ventas Diario', margin, 25)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), pageW - margin, 17, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.text(`Generado: ${timeStr}`, pageW - margin, 25, { align: 'right' })

      // ── KPI Cards (4 in a row) ─────────────────────────────
      const cardY = 46
      const cardH = 26
      const cardW = (pageW - margin * 2 - 9) / 4
      const cards = [
        { label: 'Ingresos Totales', value: `$${totalRevenue.toFixed(2)}`, color: GREEN  },
        { label: 'Órdenes del Día',  value: `${sales.length}`,             color: TEAL   },
        { label: 'Ticket Promedio',  value: `$${avgTicket.toFixed(2)}`,    color: BLUE   },
        { label: 'En Efectivo',      value: `$${cashRevenue.toFixed(2)}`,  color: ORANGE },
      ]
      cards.forEach((card, i) => {
        const x = margin + i * (cardW + 3)
        doc.setFillColor(...LIGHT)
        doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'F')
        doc.setFillColor(...card.color)
        doc.roundedRect(x, cardY, 3, cardH, 1, 1, 'F')
        doc.setTextColor(...GRAY)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.text(card.label, x + 6, cardY + 9)
        doc.setTextColor(...DARK)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(card.value, x + 6, cardY + 20)
      })

      // ── Section title helper ──────────────────────────────────
      let curY = cardY + cardH + 10
      const sectionTitle = (title: string, y: number) => {
        doc.setTextColor(...DARK)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.text(title, margin, y)
        doc.setFillColor(...TEAL)
        doc.rect(margin, y + 2, title.length * 1.8, 0.8, 'F')
      }

      // ── Orders table ──────────────────────────────────────────
      sectionTitle('Detalle de Órdenes', curY)
      curY += 7

      autoTable(doc, {
        startY: curY,
        head: [['#', 'Hora', 'Productos', 'Pago', 'Total']],
        body: sales.map((sale: any, idx: number) => [
          `#${String(idx + 1).padStart(2, '0')}`,
          sale.created_at ? new Date(sale.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          (sale.items || []).map((it: any) => {
            const name = it.name ? it.name.split('(')[0].trim() : 'Producto';
            const qty = it.quantity ?? 1;
            return `${qty}× ${name}`;
          }).join(', ') || '—',
          sale.payment_method === 'efectivo' ? 'Efectivo' : 'Transf.',
          `$${(Number(sale.total) || 0).toFixed(2)}`
        ]),
        styles:             { fontSize: 7.5, cellPadding: 3, textColor: DARK, lineColor: [225,225,225], lineWidth: 0.2 },
        headStyles:         { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 16 },
          2: { cellWidth: 106 },
          3: { cellWidth: 22 },
          4: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: margin, right: margin },
      })

      curY = (doc as any).lastAutoTable.finalY + 10

      // ── Two column section ─────────────────────────────────────
      const halfW = (pageW - margin * 2 - 6) / 2
      const rightX = margin + halfW + 6

      // Top Productos (left column)
      doc.setTextColor(...DARK)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.text('Top Productos', margin, curY)
      doc.setFillColor(...TEAL)
      doc.rect(margin, curY + 2, 26, 0.8, 'F')

      autoTable(doc, {
        startY: curY + 5,
        head: [['Producto', 'Cant.']],
        body: topProducts.map(([name, qty]) => [name, qty]),
        styles:             { fontSize: 7.5, cellPadding: 3, textColor: DARK },
        headStyles:         { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles:       { 1: { halign: 'center', cellWidth: 20 } },
        tableWidth: halfW,
        margin: { left: margin, right: rightX },
      })

      // Métodos de Pago (right column)
      doc.setTextColor(...DARK)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.text('Métodos de Pago', rightX, curY)
      doc.setFillColor(...TEAL)
      doc.rect(rightX, curY + 2, 30, 0.8, 'F')

      autoTable(doc, {
        startY: curY + 5,
        head: [['Método', 'Órdenes', 'Total']],
        body: [
          ['Efectivo',      sales.filter((s: any) => s.payment_method === 'efectivo').length,      `$${cashRevenue.toFixed(2)}`],
          ['Transferencia', sales.filter((s: any) => s.payment_method === 'transferencia').length, `$${transRevenue.toFixed(2)}`],
          ['TOTAL',         sales.length,                                                           `$${totalRevenue.toFixed(2)}`],
        ],
        styles:             { fontSize: 7.5, cellPadding: 3, textColor: DARK },
        headStyles:         { fillColor: DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: LIGHT },
        bodyStyles:         { lineColor: [225,225,225], lineWidth: 0.2 },
        columnStyles:       { 1: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' } },
        tableWidth: halfW,
        margin: { left: rightX, right: margin },
      })

      // ── Footer ────────────────────────────────────────────────
      const pageH = 297
      doc.setFillColor(...DARK)
      doc.rect(0, pageH - 14, pageW, 14, 'F')
      doc.setTextColor(...GRAY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.text('Ciocolatto · Sistema de Gestión de Heladería', margin, pageH - 5)
      doc.text(`Total del día: $${totalRevenue.toFixed(2)} · ${sales.length} órdenes · Transferencia: $${transRevenue.toFixed(2)}`, pageW - margin, pageH - 5, { align: 'right' })

      const fileName = `Reporte_Ciocolatto_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Output handling for different browsers
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // More robust approach for mobile: Open in a new tab
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.success("PDF abierto en una nueva pestaña (Mobile)");
      } else {
        doc.save(fileName)
        toast.success("Reporte PDF generado exitosamente")
      }

      toast.dismiss(loadingToast)
      setSalesHistory([])
      toast.success("Día finalizado correctamente.", { duration: 5000 })
    } catch (e) {
      console.error("PDF Generation Error:", e)
      toast.dismiss(loadingToast)
      toast.error("Error al generar el PDF. Verifica la conexión.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }


  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-4 sm:mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
            <div>
              <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-2 sm:mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Ventas del Día</h1>
              <p className="text-xs sm:text-base text-gray-600">Registra pedidos y gestiona las ventas</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end border-t border-zinc-300 md:border-0 pt-4 md:pt-0">
              <Button
                onClick={() => setShowPendingModal(true)}
                variant="outline"
                className="rounded-xl h-10 md:h-12 px-3 md:px-6 border-zinc-300 hover:bg-zinc-100 bg-white shadow-sm text-zinc-700 relative text-xs font-semibold md:text-sm flex-1 md:flex-none justify-center"
              >
                <Clock className="w-4 h-4 md:mr-2 flex-shrink-0" />
                <span className="hidden md:inline">Órdenes Pendientes</span>
                <span className="md:hidden ml-1">Pendientes</span>
                {pendingOrders.length > 0 && (
                  <span className="absolute -top-2 -right-2 md:static md:ml-2 bg-red-500 text-white rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs">
                    {pendingOrders.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleShowHistory}
                variant="outline"
                className="rounded-xl h-10 md:h-12 px-3 md:px-6 border-zinc-300 hover:bg-zinc-100 bg-white shadow-sm text-zinc-700 text-xs font-semibold md:text-sm flex-1 md:flex-none justify-center"
              >
                <History className="w-4 h-4 md:mr-2 flex-shrink-0" />
                <span className="hidden md:inline">Historial</span>
                <span className="md:hidden ml-1">Hist.</span>
              </Button>
              <Button
                onClick={handleFinishDay}
                disabled={isGeneratingPdf}
                variant="outline"
                className={`rounded-xl h-10 md:h-12 px-3 md:px-6 border-zinc-300 hover:bg-zinc-100 bg-white shadow-sm text-zinc-700 text-xs font-semibold md:text-sm flex-1 md:flex-none justify-center transition-all ${isGeneratingPdf ? 'opacity-50' : ''}`}
              >
                {isGeneratingPdf ? (
                   <span className="flex items-center gap-2">
                     <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                     <span className="md:inline hidden">Generando...</span>
                     <span className="md:hidden">...</span>
                   </span>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 md:mr-2 flex-shrink-0" />
                    <span className="hidden md:inline">Finalizar Día</span>
                    <span className="md:hidden ml-1">Cerrar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-6">
              {categories.map((category) => {
                // Mapear categorías a sus imágenes correspondientes
                const getCategoryImage = (cat: string) => {
                  const imageMap: { [key: string]: string } = {
                    'helados_clasicos': '/helado.jpg',
                    'helados_con_queso': '/helado-queso.jpeg',
                    'waffles': '/waffle.jpg',
                    'fresh_fruits': '/fresh_fruits.jpg',
                    'jugos_naturales': '/jugos.jpg',
                    'bebidas_frias': '/bebidas-frias.png',
                    'bebidas_calientes': '/bebidas-calientes.png',
                    'acompanantes': '/acompanantes.jpg',
                    'pasteleria': '/pasteleria.jpg',
                    'extras': '/extras.png',
                    'todos': '/helado-icono.png'
                  }
                  return imageMap[cat] || '/helado-icono.png'
                }

                return (
                <div
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative h-28 sm:h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer transition-all ${
                    selectedCategory === category
                      ? "ring-4 ring-zinc-900 scale-[1.02] md:scale-105 shadow-xl"
                      : "hover:-translate-y-1 shadow-md hover:shadow-lg"
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={getCategoryImage(category)}
                    alt={category}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                    selectedCategory === category
                      ? "bg-[#5cbdb2]/80"
                      : "bg-black/40 hover:bg-black/50"
                  }`}>
                    <span className="text-white font-bold text-lg md:text-2xl capitalize px-2 md:px-4 text-center leading-tight drop-shadow-md">
                      {category === "todos" ? "Todos" : category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedCategory === category && (
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1.5">
                      <svg className="w-6 h-6 text-[#5cbdb2]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          {/* Modal de Productos */}
          {showProductsModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center">
              <div className="bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">

                {/* ─── HEADER FIJO ─── */}
                <div className="flex-shrink-0 bg-white border-b border-zinc-100 px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900 capitalize">
                        {selectedCategory === 'todos' ? 'Todos los productos' : selectedCategory.replace(/_/g, ' ')}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">{filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}</p>
                    </div>
                    {/* X FIJA – nunca se mueve */}
                    <button
                      onClick={handleCloseProductsModal}
                      className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Cerrar"
                    >
                      <X className="w-4 h-4 text-zinc-600" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 bg-zinc-50"
                    />
                  </div>
                </div>

                {/* ─── CONTENIDO CON SCROLL ─── */}
                <div className="flex-1 overflow-y-auto p-5">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400">
                      <p className="text-sm font-medium">No hay productos disponibles</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredProducts.map((product) => {
                      const requiresStock = ["jugos_naturales", "bebidas_calientes", "acompanantes", "pasteleria"].includes(product.type.toLowerCase())
                      const isOutOfStock = requiresStock && product.stock === 0

                      return (
                        <div
                          key={product.id}
                          className={`border-2 rounded-2xl overflow-hidden transition-all ${
                            isOutOfStock
                              ? 'border-red-200 bg-red-50 opacity-60'
                              : 'border-zinc-200 hover:border-zinc-400 hover:shadow-lg hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Imagen */}
                          <div className="relative bg-zinc-100 h-32 sm:h-40 overflow-hidden group">
                            <img
                              src={
                                {
                                  'helados_clasicos': '/helado.jpg',
                                  'helados_con_queso': '/helado-queso.jpeg',
                                  'waffles': '/waffle.jpg',
                                  'fresh_fruits': '/fresh_fruits.jpg',
                                  'jugos_naturales': '/jugos.jpg',
                                  'bebidas_frias': '/bebidas-frias.png',
                                  'bebidas_calientes': '/bebidas-calientes.png',
                                  'acompanantes': '/acompanantes.jpg',
                                  'pasteleria': '/pasteleria.jpg',
                                  'extras': '/extras.png'
                                }[product.type] || '/helado-icono.png'
                              }
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {requiresStock && (
                              <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                                isOutOfStock ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                              }`}>
                                {isOutOfStock ? 'Agotado' : `${product.stock}`}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3 bg-white">
                            <h3 className="font-bold text-zinc-800 text-sm leading-tight line-clamp-2 mb-2 min-h-[36px]">{product.name}</h3>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-black text-emerald-700 text-base">${product.price.toFixed(2)}</span>
                              <Button
                                onClick={() => handleAddToOrder(product)}
                                disabled={isOutOfStock}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-9 px-3 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {isOutOfStock ? 'Agotado' : 'Agregar'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Floating Order Button */}
          <div className="fixed bottom-6 right-6 z-50">
            {!isOrderExpanded ? (
              <Button
                onClick={() => setIsOrderExpanded(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full h-16 w-16 shadow-2xl hover:scale-110 transition-all relative"
              >
                <ShoppingCart className="w-7 h-7" />
                {orderItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {orderItems.length}
                  </span>
                )}
              </Button>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 w-[calc(100vw-2rem)] sm:w-[500px] max-h-[85vh] sm:max-h-[68vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-zinc-100 border border-zinc-300 p-2 sm:p-3 rounded-xl hidden sm:block">
                      <ShoppingCart className="w-6 h-6 text-zinc-900" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Orden Actual</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOrderExpanded(false)}
                    className="hover:bg-gray-100 rounded-full h-10 w-10 p-0 flex items-center justify-center shrink-0 bg-gray-50"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>

                {orderItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay productos en la orden</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                      {orderItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-base">
                              <span className="text-[#5cbdb2] font-bold mr-2 text-lg">{item.quantity}</span>
                              {item.name}
                            </p>
                            <p className="text-base text-gray-600 mt-1">
                              ${item.price.toFixed(2)} {item.quantity > 1 && `× ${item.quantity}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-800 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="hover:bg-red-50 hover:text-red-600 rounded-lg h-9 w-9 p-0"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-300 pt-6 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-semibold text-gray-700">Total</span>
                        <span className="text-3xl font-bold text-gray-900">
                          ${orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="mb-6">
                        <label className="text-base font-semibold text-gray-700 mb-3 block">Método de Pago</label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="radio"
                              id="efectivo"
                              value="efectivo"
                              checked={paymentMethod === "efectivo"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="cursor-pointer w-4 h-4"
                            />
                            <label htmlFor="efectivo" className="cursor-pointer text-[13px] sm:text-base font-medium">
                              💵 Efectivo
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="radio"
                              id="transferencia"
                              value="transferencia"
                              checked={paymentMethod === "transferencia"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="cursor-pointer w-4 h-4"
                            />
                            <label htmlFor="transferencia" className="cursor-pointer text-[13px] sm:text-base font-medium">
                              💳 Transferencia
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        handleSubmitOrder(paymentMethod)
                        setIsOrderExpanded(false)
                        setShowProductsModal(false)
                        setSelectedCategory("")
                        setShowOptionsModal(false)
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-14 text-lg font-semibold transition-all hover:-translate-y-1"
                    >
                      Orden Lista
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SalesHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        sales={salesHistory}
      />

      <ProductOptionsModal
        isOpen={showOptionsModal}
        onClose={() => {
          setShowOptionsModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onConfirm={handleOptionsConfirm}
      />
      
      <PendingOrdersModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        pendingOrders={pendingOrders}
        onMarkAsDelivered={handleMarkAsDelivered}
      />
    </>
  )
}
